/**
 * Script para cargar los productos del JSON local a Firestore.
 * Ejecutar UNA sola vez: node backend/scripts/seedProductos.js
 */

require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const { db } = require("../config/firebase");

const productos = [
  {
    nombre: "Portátil Dell XPS 15",
    precio: 4599.99,
    stock: 12,
    categoria: "Laptops",
    rating: 4,
    imagen: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTQa_32WpO973l2DpMxWSzEcJhxWMvJm-HUjQ&s",
    oferta: true,
    descripcion: "Laptop premium con pantalla OLED 4K de 15.6\", procesador Intel Core i9, 32GB RAM y GPU NVIDIA RTX 4070.",
  },
  {
    nombre: "Mouse Razer DeathAdder V3",
    precio: 349.99,
    stock: 25,
    categoria: "Periféricos",
    rating: 5,
    imagen: "https://cyccomputer.pe/49869-large_default/mouse-razer-deathadder-v3-pro-chroma-30k-dpi-usb-c-black-pnrz01-04630100-r3u1.jpg",
    oferta: false,
    descripcion: "Mouse gaming ergonómico con sensor Focus Pro 30K, 90 horas de batería inalámbrica y switches ópticos de 90 millones de clics.",
  },
  {
    nombre: "Teclado Mecánico HyperX Alloy",
    precio: 529.99,
    stock: 8,
    categoria: "Periféricos",
    rating: 4,
    imagen: "https://promart.vteximg.com.br/arquivos/ids/7479097-1000-1000/image-9af968446b50480fade90869c612e40f.jpg?v=638305829355370000",
    oferta: true,
    descripcion: "Teclado mecánico TKL con switches HyperX Red lineales, retroiluminación RGB y construcción de aluminio aeronáutico.",
  },
  {
    nombre: "Monitor ASUS ROG 27\" 165Hz",
    precio: 1899.99,
    stock: 5,
    categoria: "Monitores",
    rating: 5,
    imagen: "https://dlcdnwebimgs.asus.com/gain/EC6E1306-068B-4881-A57F-DFFFAAC020C8/w717/h525",
    oferta: false,
    descripcion: "Monitor IPS de 27\" QHD con 165Hz, 1ms, compatible con G-Sync y FreeSync Premium.",
  },
  {
    nombre: "GPU NVIDIA RTX 4060 Ti",
    precio: 2199.99,
    stock: 3,
    categoria: "Componentes",
    rating: 5,
    imagen: "https://wondercris.com/cdn/shop/files/2ca0fc27-58da-40b2-b9b5-f60b3777bf73.jpg?v=1719142396",
    oferta: true,
    descripcion: "Tarjeta gráfica Ada Lovelace con 8GB GDDR6, DLSS 3 y ray tracing en tiempo real para gaming 4K.",
  },
  {
    nombre: "Auriculares SteelSeries Arctis 7",
    precio: 699.99,
    stock: 15,
    categoria: "Audio",
    rating: 4,
    imagen: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR38nw-a78kCgVEhL5KkzWqnw7VP4UyM1exYw&s",
    oferta: false,
    descripcion: "Auriculares inalámbricos con sonido surround 7.1, micrófono ClearCast y 24 horas de batería.",
  },
  {
    nombre: "Laptop ASUS ROG Strix G16",
    precio: 5299.99,
    stock: 7,
    categoria: "Laptops",
    rating: 5,
    imagen: "https://dlcdnwebimgs.asus.com/gain/378C75D6-8210-4DA7-AAE9-84B48458B085",
    oferta: true,
    descripcion: "Laptop gaming con RTX 4070, pantalla 16\" 240Hz QHD, Intel Core i9 13va gen y 16GB DDR5.",
  },
  {
    nombre: "SSD Samsung 990 Pro 2TB",
    precio: 649.99,
    stock: 20,
    categoria: "Componentes",
    rating: 5,
    imagen: "https://www.loginstore.com/img/datasheet/SSDSM990PRO2TB_LARGE.jpg",
    oferta: false,
    descripcion: "SSD NVMe PCIe 4.0 con velocidades de lectura hasta 7450 MB/s. Ideal para gaming y edición profesional.",
  },
  {
    nombre: "Silla Gaming Secretlab Titan",
    precio: 1299.99,
    stock: 6,
    categoria: "Accesorios",
    rating: 4,
    imagen: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQKOyc9taxyvZaW4RPtqLhYv6VT72CRH0FZvQ&s",
    oferta: false,
    descripcion: "Silla gaming premium con soporte lumbar magnético, reposabrazos 4D y tapizado SoftWeave transpirable.",
  },
  {
    nombre: "Mousepad Razer Gigantus V2 XXL",
    precio: 189.99,
    stock: 30,
    categoria: "Accesorios",
    rating: 4,
    imagen: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQD-9tnpv23MSu9j9qpgwwDcq_flIcZIJLZWA&s",
    oferta: true,
    descripcion: "Mousepad XXL de 940x410mm con base antideslizante de goma y superficie micro-texturizada para máxima precisión.",
  },
  {
    nombre: "RAM Corsair Vengeance 32GB DDR5",
    precio: 449.99,
    stock: 14,
    categoria: "Componentes",
    rating: 5,
    imagen: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS8I-vd-TeaYOq7G1dx3pxJE4dYH-0fmqepIA&s",
    oferta: false,
    descripcion: "Kit de memoria DDR5 32GB (2x16GB) a 5600MHz con iluminación RGB dinámica y perfil XMP 3.0.",
  },
  {
    nombre: "Webcam Logitech Brio 4K",
    precio: 579.99,
    stock: 9,
    categoria: "Accesorios",
    rating: 4,
    imagen: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTygBtNXfdomCmuJEK_gmhqXMe3Ptkv7bTsxA&s",
    oferta: true,
    descripcion: "Webcam 4K Ultra HD con HDR, campo de visión ajustable, compatible con Windows Hello y streaming profesional.",
  },
];

async function seed() {
  console.log("Iniciando seed de productos en Firestore...\n");

  const batch = db.batch();
  const colRef = db.collection("productos");

  for (const producto of productos) {
    const ref = colRef.doc(); // ID automático
    batch.set(ref, { ...producto, creadoEn: new Date().toISOString() });
    console.log(`  ✔ ${producto.nombre}`);
  }

  await batch.commit();
  console.log(`\n✅ ${productos.length} productos cargados correctamente en Firestore.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Error en seed:", err.message);
  process.exit(1);
});
