from ultralytics import YOLO
import cv2
import numpy as np
import socketio
import json
import threading
import time

# Inicializar Socket.IO cliente
sio = socketio.Client()

@sio.event
def connect():
    print('✅ Conectado al servidor Socket.IO')

@sio.event
def disconnect():
    print('❌ Desconectado del servidor Socket.IO')

# Intentar conectar al servidor
try:
    sio.connect('http://localhost:3001')
    print("Intento de conexión a Socket.IO...")
except Exception as e:
    print(f"❌ Error conectando a Socket.IO: {e}")
    # Considera si el programa debe continuar sin conexión al servidor
    # Por ahora, continuaremos pero los datos no se enviarán.

model = YOLO("best.pt")

# Configurar cámara
# Eliminamos el backend DSHOW para una mayor compatibilidad
cap = cv2.VideoCapture(0)

# Verificar si la cámara se abrió correctamente
if not cap.isOpened():
    print("❌ Error: No se pudo abrir la cámara. Asegúrate de que no esté en uso por otra aplicación.")
    # Si no se puede abrir la cámara, no tiene sentido continuar
    if sio.connected:
        sio.disconnect()
    exit()

cap.set(cv2.CAP_PROP_FRAME_WIDTH, 680)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)

TARGET_WIDTH = 680
TARGET_HEIGHT = 480

# Recalcular secciones
grid_width = TARGET_WIDTH // 2
grid_height = TARGET_HEIGHT // 2

sections = {
    "Mesa 1": {"coords": (0, 0, grid_width, grid_height), "id": 1},
    "Mesa 2": {"coords": (grid_width, 0, TARGET_WIDTH, grid_height), "id": 2},
    "Mesa 3": {"coords": (0, grid_height, grid_width, TARGET_HEIGHT), "id": 3},
    "Mesa 4": {"coords": (grid_width, grid_height, TARGET_WIDTH, TARGET_HEIGHT), "id": 4}
}

# Estado anterior para evitar envíos duplicados
previous_states = {1: None, 2: None, 3: None, 4: None}

COLORS = {
    "no_mesa": (128, 128, 128),
    "libre": (0, 255, 0),
    "ocupada": (0, 0, 255)
}

def check_section_status(section_coords, detections):
    """Determina el estado de una sección basado en las detecciones"""
    x1, y1, x2, y2 = section_coords
    
    mesa_detectada = False
    persona_detectada = False
    
    # Asegurarse de que detections.boxes no esté vacío
    if detections and hasattr(detections, 'boxes') and detections.boxes.xywh.shape[0] > 0:
        for box in detections.boxes:
            cls = int(box.cls[0])
            label = model.names[cls]
            x, y, w, h = box.xywh[0]
            
            center_x, center_y = int(x), int(y)
            
            if x1 <= center_x <= x2 and y1 <= center_y <= y2:
                if label == "mesa":
                    mesa_detectada = True
                elif label == "persona":
                    persona_detectada = True
    
    if not mesa_detectada:
        return "no_mesa", "No hay mesa"
    elif not persona_detectada:
        return "libre", "Mesa Libre"
    else:
        return "ocupada", "Mesa Ocupada"

def send_mesa_status(mesa_id, status):
    """Envía el estado de una mesa por Socket.IO"""
    if status == "no_mesa":
        return
    
    ocupada = status == "ocupada"
    
    if previous_states[mesa_id] == ocupada:
        return
    
    previous_states[mesa_id] = ocupada
    
    data = {
        "mesa": mesa_id,
        "estado": "ocupada" if ocupada else "libre"
    }
    
    try:
        if sio.connected:
            sio.emit('estadoMesa', json.dumps(data))
            print(f"📤 Enviado: Mesa {mesa_id} → {'ocupada' if ocupada else 'libre'}")
        else:
            print(f"⚠️ No se pudo enviar el estado: Socket.IO no está conectado.")
    except Exception as e:
        print(f"❌ Error enviando estado: {e}")

# Asegúrate de haber instalado la librería: pip install "python-socketio[client]"

while True:
    ret, frame = cap.read()
    if not ret:
        print("❌ Error: Fallo al leer el frame de la cámara. Saliendo del programa.")
        break
    
    if frame.shape[1] != TARGET_WIDTH or frame.shape[0] != TARGET_HEIGHT:
        frame = cv2.resize(frame, (TARGET_WIDTH, TARGET_HEIGHT))
    
    results = model(frame, device="cuda")
    
    annotated_frame = frame.copy()
    
    # Dibujar líneas de la grilla
    cv2.line(annotated_frame, (grid_width, 0), (grid_width, TARGET_HEIGHT), (255, 255, 255), 2)
    cv2.line(annotated_frame, (0, grid_height), (TARGET_WIDTH, grid_height), (255, 255, 255), 2)
    
    # Procesar cada sección y enviar estados
    for section_name, section_data in sections.items():
        coords = section_data["coords"]
        mesa_id = section_data["id"]
        
        status, text = check_section_status(coords, results[0])
        
        # Enviar estado por Socket.IO
        send_mesa_status(mesa_id, status)
        
        # Dibujar visualización
        color = COLORS[status]
        cv2.rectangle(annotated_frame, (coords[0], coords[1]), (coords[2], coords[3]), color, 3)
        
        cv2.putText(annotated_frame, section_name, (coords[0] + 10, coords[1] + 30), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
        cv2.putText(annotated_frame, text, (coords[0] + 10, coords[1] + 60), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
    
    yolo_annotations = results[0].plot()
    combined = cv2.addWeighted(annotated_frame, 0.7, yolo_annotations, 0.3, 0)
    
    cv2.imshow("Processing - Gestión de Mesas", combined)
    
    if cv2.waitKey(1) & 0xFF == 27:
        break

# Desconectar al salir
if sio.connected:
    sio.disconnect()
cap.release()
cv2.destroyAllWindows()
