import gab.opencv.*;
import processing.video.*;
import http.requests.*;
import java.awt.Rectangle;

Capture cam;
OpenCV cv;
ArrayList<Contour> contours;

// Representación de cada mesa (zona en pantalla)
class Mesa {
  int id;
  Rectangle zona;
  boolean ocupada;
  float maxArea;

  Mesa(int id, int x, int y, int w, int h) {
    this.id = id;
    zona = new Rectangle(x, y, w, h);
    ocupada = false;
    maxArea = 0;
  }
}

ArrayList<Mesa> mesas = new ArrayList<Mesa>();

void setup() {
  size(680, 480);
  frameRate(30);

  cam = new Capture(this, 680, 480);
  cam.start();

  cv = new OpenCV(this, 680, 480);

  // Dividir pantalla en 2 mesas: izquierda y derecha
  mesas.add(new Mesa(1, 0, 0, width / 2, height));         // Mesa izquierda
  mesas.add(new Mesa(2, width / 2, 0, width / 2, height)); // Mesa derecha
}

void draw() {
  for (Mesa m : mesas) {
    m.ocupada = false;
    m.maxArea = 0;
  }

  if (cam.available()) {
    cam.read();
    cv.loadImage(cam);

    // Preprocesamiento
    cv.gray();
    cv.blur(7);
    cv.threshold(110);

    contours = cv.findContours();

    image(cam, 0, 0);

    for (Contour c : contours) {
      float area = c.area();
      if (area < 1000) continue;

      // FILTROS DE FORMA Y CALIDAD
      Contour approx = c.getPolygonApproximation();
      int sides = approx.getPoints().size();
      if (sides < 4 || sides > 6) continue;

      Contour hull = c.getConvexHull();
      float hullArea = hull.area();
      if (hullArea == 0) continue;
      float solidity = area / hullArea;
      if (solidity < 0.85) continue;

      Rectangle r = c.getBoundingBox();
      float w = r.width;
      float h = r.height;
      float ratio = max(w, h) / min(w, h);
      if (ratio < 0.6 || ratio > 3.0) continue;

      // Centro del contorno
      PVector centro = new PVector(r.x + r.width / 2, r.y + r.height / 2);

      // Registrar área más grande por zona
      for (Mesa m : mesas) {
        if (m.zona.contains((int)centro.x, (int)centro.y)) {
          if (area > m.maxArea) {
            m.maxArea = area;
          }
        }
      }

      // Dibujar contorno válido
      noFill();
      stroke(0, 255, 0);
      strokeWeight(2);
      c.draw();
    }

    // Evaluar estado y mostrar resultado
    for (Mesa m : mesas) {
      m.ocupada = m.maxArea > 9000; // UMBRAL DE OCUPACIÓN (ajustable)

      // Dibujar zona
      noFill();
      stroke(m.ocupada ? color(255, 0, 0) : color(0, 255, 0));
      strokeWeight(3);
      rect(m.zona.x, m.zona.y, m.zona.width, m.zona.height);

      // Etiqueta
      fill(255);
      textSize(16);
      text("Mesa " + m.id + ": " + (m.ocupada ? "Ocupada" : "Libre"), m.zona.x + 10, m.zona.y + 30);

      // Enviar estado a la API
      enviarEstadoMesa(m.id, m.ocupada);
    }
  }
}

// Enviar estado vía POST a una API
void enviarEstadoMesa(int id, boolean ocupada) {
  JSONObject json = new JSONObject();
  json.setInt("mesa", id);
  json.setString("estado", ocupada ? "ocupada" : "libre");

  try {
    PostRequest post = new PostRequest("http://localhost:3000/estado");
    post.addHeader("Content-Type", "application/json");
    post.addData(json.toString());
    post.send();
    println("Enviado: Mesa " + id + " → " + (ocupada ? "ocupada" : "libre"));
  } catch (Exception e) {
    println("Error enviando estado: " + e.getMessage());
  }
}