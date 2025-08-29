-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 29-08-2025 a las 06:59:59
-- Versión del servidor: 10.4.28-MariaDB
-- Versión de PHP: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `aplicativos_moviles`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mesas`
--

CREATE TABLE `mesas` (
  `id` int(11) NOT NULL,
  `estado` varchar(10) DEFAULT NULL CHECK (`estado` in ('libre','ocupada'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `mesas`
--

INSERT INTO `mesas` (`id`, `estado`) VALUES
(1, 'ocupada'),
(2, 'ocupada'),
(3, 'ocupada'),
(4, 'ocupada');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pedidos`
--

CREATE TABLE `pedidos` (
  `id` int(11) NOT NULL,
  `mesa` varchar(50) DEFAULT NULL,
  `pedido` text DEFAULT NULL,
  `nota` text DEFAULT NULL,
  `hora` datetime DEFAULT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `pedidos`
--

INSERT INTO `pedidos` (`id`, `mesa`, `pedido`, `nota`, `hora`, `estado`) VALUES
(2, 'Mesa 1', '{\"Gazpacho Andaluz\":{\"cantidad\":2,\"precio\":8}}', '', '2025-07-23 00:04:09', 0),
(3, 'Mesa 1', '{\"Paella Valenciana\":{\"cantidad\":1,\"precio\":18.5}}', '', '2025-07-23 00:04:22', 0),
(10, 'Mesa 1', '{\"Gazpacho Andaluz\":{\"cantidad\":3,\"precio\":8},\"Paella Valenciana\":{\"cantidad\":1,\"precio\":18.5}}', '', '2025-08-22 04:20:50', 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `platos`
--

CREATE TABLE `platos` (
  `id` int(11) NOT NULL,
  `nombre` varchar(40) NOT NULL,
  `precio` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `platos`
--

INSERT INTO `platos` (`id`, `nombre`, `precio`) VALUES
(1, 'Asado de tira', 12500),
(2, 'Empanadas de car', 4500),
(3, 'Milanesa a la napolitana', 8900),
(4, 'Choripán', 3500),
(5, 'Locro', 6000),
(6, 'Humita en chala', 5500),
(7, 'Parrillada completa', 22000),
(8, 'Ñoquis con estofado', 7200),
(9, 'Provoleta a la provenzal', 4800),
(10, 'Matambre a la pizza', 9500),
(12, 'Revuelto Gramajo', 6900),
(13, 'Alfajor de maicena', 1800),
(14, 'Pastel de papas', 8000);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `mesas`
--
ALTER TABLE `mesas`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `pedidos`
--
ALTER TABLE `pedidos`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `platos`
--
ALTER TABLE `platos`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `pedidos`
--
ALTER TABLE `pedidos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `platos`
--
ALTER TABLE `platos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
