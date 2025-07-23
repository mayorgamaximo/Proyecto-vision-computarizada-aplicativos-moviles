-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 23-07-2025 a las 03:53:03
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
(1, 'Mesa 1', '{\"Gazpacho Andaluz\":{\"cantidad\":2,\"precio\":8}}', 'aa', '2025-07-23 00:00:39', 1),
(2, 'Mesa 1', '{\"Gazpacho Andaluz\":{\"cantidad\":2,\"precio\":8}}', '', '2025-07-23 00:04:09', 1),
(3, 'Mesa 1', '{\"Paella Valenciana\":{\"cantidad\":1,\"precio\":18.5}}', '', '2025-07-23 00:04:22', 0),
(4, 'Mesa 2', '{\"Gazpacho Andaluz\":{\"cantidad\":2,\"precio\":8}}', '', '2025-07-23 00:09:47', 0),
(5, 'Mesa 1', '{\"Gazpacho Andaluz\":{\"cantidad\":2,\"precio\":8}}', '', '2025-07-23 00:12:12', 1),
(6, 'Mesa 1', '{\"Gazpacho Andaluz\":{\"cantidad\":1,\"precio\":8},\"Cordero Asado\":{\"cantidad\":1,\"precio\":24}}', 'cordero sin sal', '2025-07-23 00:43:18', 1),
(7, 'Mesa 1', '{\"Gazpacho Andaluz\":{\"cantidad\":2,\"precio\":8}}', '', '2025-07-23 01:39:52', 0);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `pedidos`
--
ALTER TABLE `pedidos`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `pedidos`
--
ALTER TABLE `pedidos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
