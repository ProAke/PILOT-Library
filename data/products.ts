export type CategorySlug = "apparel" | "bags" | "accessories" | "souvenirs";

export type ProductImage = {
  /** Local, pre-optimised asset (used as the default / offline source) */
  src: string;
  /** Google Drive file id — lets the live API swap in fresh photos */
  driveId: string;
  alt: string;
};

export type ProductColor = { name: string; hex: string };

export type Product = {
  slug: string;
  sku: string;
  name: string;
  nameEn: string;
  category: CategorySlug;
  /** THB. `null` = ราคาแจ้งโดยร้าน (สอบถามราคา) */
  price: number | null;
  sizes?: string[];
  colors?: ProductColor[];
  summary: string;
  description: string;
  specs: { label: string; value: string }[];
  tags: ("new" | "bestseller" | "limited" | "eco")[];
  images: ProductImage[];
  /** Source file name inside the Google Drive folder `Pilot-library` */
  driveFile: string;
  updatedAt: string;
};

export type Category = {
  slug: CategorySlug;
  name: string;
  nameTh: string;
  blurb: string;
};

export const CATEGORIES: Category[] = [
  {
    slug: "apparel",
    name: "Apparel",
    nameTh: "เสื้อผ้า & เครื่องแบบ",
    blurb: "เสื้อโปโล เสื้อยืดกราฟิก และแจ็คเก็ตสำหรับนักบินและผู้ที่รักการบิน",
  },
  {
    slug: "bags",
    name: "Bags",
    nameTh: "กระเป๋า",
    blurb: "กระเป๋าผ้าแคนวาส กระเป๋าเดินทาง และเป้สะพายที่ผลิตจากงานจริงของนักบิน",
  },
  {
    slug: "accessories",
    name: "Accessories",
    nameTh: "อุปกรณ์การบิน",
    blurb: "สายคล้องบัตร ป้ายชื่อ กระเป๋าใส่บัตร และแก้วเก็บอุณหภูมิ",
  },
  {
    slug: "souvenirs",
    name: "Souvenirs",
    nameTh: "ของที่ระลึก",
    blurb: "ร่ม พวงกุญแจ และของที่ระลึกชิ้นเล็กที่พกพาความทรงจำการบินไปด้วย",
  },
];

export const CATEGORY_BY_SLUG: Record<CategorySlug, Category> = CATEGORIES.reduce(
  (acc, c) => ({ ...acc, [c.slug]: c }),
  {} as Record<CategorySlug, Category>,
);

const SIZE_ADULT = ["S", "M", "L", "XL", "2XL"];
const SIZE_KIDS = ["14", "16", "26", "30"];
const SIZE_BAG = ["S", "M", "L"];

export const PRODUCTS: Product[] = [
  /* ---------------------------------------------------------------- apparel */
  {
    slug: "thai-pilot-recruitment-polo",
    sku: "PL-AP-001",
    name: "Thai Pilot Recruitment Polo",
    nameEn: "Thai Pilot Recruitment Polo",
    category: "apparel",
    price: null,
    sizes: SIZE_ADULT,
    colors: [{ name: "Navy", hex: "#1B2450" }],
    summary: "โปโลคอปราด สีกรมท่า ปักตรา THAI PILOT RECRUITMENT",
    description:
      "เสื้อโปโลแขนสั้นสีกรมท่า เนื้อผ้าโปร่งระบายอากาศ เหมาะกับวันทำงานหรือวันเดินทาง ปักตรา THAI PILOT RECRUITMENT ด้านหลัง พร้อมรายละเอียดสปีดแองเจิลที่แขนเสื้อ",
    specs: [
      { label: "เนื้อผ้า", value: "โพลีเอสเตอร์ผสมคอตตอน" },
      { label: "ทรง", value: "Regular fit คอปราด" },
      { label: "งานปัก", value: "ปักตราด้านหลัง + แขนเสื้อ" },
    ],
    tags: ["new"],
    driveFile: "483428555_1146095110547747_7927893319459794111_n.jpg",
    updatedAt: "2026-11-05",
    images: [
      {
        src: "/catalog/thai-pilot-polo-1.jpg",
        driveId: "1WcXqlRIMXMJcg1u-3gTOdckv62O3MC7E",
        alt: "เสื้อโปโล Thai Pilot Recruitment สีกรมท่า",
      },
    ],
  },
  {
    slug: "graphic-tee-bone",
    sku: "PL-AP-002",
    name: "Graphic Tee · Bone",
    nameEn: "Graphic Tee — Bone",
    category: "apparel",
    price: 300,
    sizes: SIZE_ADULT,
    colors: [{ name: "Bone", hex: "#F2EDE3" }],
    summary: "เสื้อยืดสกรีนลาย #ไทยนี้รักสงบ สีขาวนวล",
    description:
      "เสื้อยืดคอกลมผ้าคอตตอน 100% สกรีนลายน้องนักบินพร้อมหมวกทหารและธงชาติ ข้อความ “#ไทยนี้รักสงบ” ผลิตเป็นล็อตเล็กในแต่ละรอบ",
    specs: [
      { label: "เนื้อผ้า", value: "คอตตอน 100%" },
      { label: "ไซซ์", value: "S · M · L · XL · 2XL (34–50)" },
      { label: "งานพิมพ์", value: "สกรีนซิลค์ 3 สี" },
    ],
    tags: ["bestseller"],
    driveFile: "528033376_1254071729750084_8678912893189217030_n.jpg",
    updatedAt: "2026-11-05",
    images: [
      {
        src: "/catalog/graphic-tee-bone-1.jpg",
        driveId: "1sfYcKvxXL3YV8X1_CkbmyAK2at16z94W",
        alt: "เสื้อยืดกราฟิกสีขาวนวล ลายน้องนักบิน #ไทยนี้รักสงบ",
      },
    ],
  },
  {
    slug: "graphic-tee-olive",
    sku: "PL-AP-003",
    name: "Graphic Tee · Olive",
    nameEn: "Graphic Tee — Olive",
    category: "apparel",
    price: 300,
    sizes: SIZE_ADULT,
    colors: [{ name: "Olive", hex: "#5D5B33" }],
    summary: "เสื้อยืดสกรีนลาย #ไทยนี้รักสงบ สีเขียวมะกอก",
    description:
      "เสื้อยืดคอกลมผ้าคอตตอน 100% โทนสีเขียวมะกอกเข้ากับลายพราง สกรีนลายน้องนักบินพร้อมธงชาติและข้อความ “#ไทยนี้รักสงบ”",
    specs: [
      { label: "เนื้อผ้า", value: "คอตตอน 100%" },
      { label: "ไซซ์", value: "S · M · L · XL · 2XL (34–50)" },
      { label: "งานพิมพ์", value: "สกรีนซิลค์ 3 สี" },
    ],
    tags: [],
    driveFile: "514329143_1254071763083414_5486668837346366968_n.jpg",
    updatedAt: "2026-11-05",
    images: [
      {
        src: "/catalog/graphic-tee-olive-1.jpg",
        driveId: "1YcbvUlVxPczFf9CcQfaliXOE7_TvyX-i",
        alt: "เสื้อยืดกราฟิกสีเขียวมะกอก ลายน้องนักบิน",
      },
    ],
  },
  {
    slug: "graphic-tee-field-green",
    sku: "PL-AP-004",
    name: "Graphic Tee · Field Green",
    nameEn: "Graphic Tee — Field Green",
    category: "apparel",
    price: 300,
    sizes: SIZE_ADULT,
    colors: [{ name: "Field Green", hex: "#4B5B2E" }],
    summary: "เสื้อยืดสกรีนลาย #ไทยนี้รักสงบ สีเขียวสนาม",
    description:
      "เสื้อยืดคอกลมผ้าคอตตอน 100% สีเขียวสนาม สกรีนลายน้องนักบินพร้อมหมวกและธงชาติ เหมาะกับลุคลำลองแบบ aviation",
    specs: [
      { label: "เนื้อผ้า", value: "คอตตอน 100%" },
      { label: "ไซซ์", value: "S · M · L · XL · 2XL (34–50)" },
      { label: "งานพิมพ์", value: "สกรีนซิลค์ 3 สี" },
    ],
    tags: [],
    driveFile: "514329143_1254071763083414_5486668837346366968_n.jpg",
    updatedAt: "2026-11-05",
    images: [
      {
        src: "/catalog/graphic-tee-forest-1.jpg",
        driveId: "1YcbvUlVxPczFf9CcQfaliXOE7_TvyX-i",
        alt: "เสื้อยืดกราฟิกสีเขียวสนาม ลายน้องนักบิน",
      },
    ],
  },
  {
    slug: "kids-graphic-tee",
    sku: "PL-AP-005",
    name: "Kids Graphic Tee",
    nameEn: "Kids Graphic Tee",
    category: "apparel",
    price: 150,
    sizes: SIZE_KIDS,
    colors: [
      { name: "Red", hex: "#C0392B" },
      { name: "Blue", hex: "#3C6E9F" },
    ],
    summary: "เสื้อยืดเด็ก สกรีนลาย #ไทยนี้รักสงบ",
    description:
      "เสื้อยืดสำหรับเด็ก เนื้อผ้านุ่ม สกรีนลายน้องนักบินพร้อมธงชาติ มีทั้งสีแดงและสีฟ้า ไซซ์ 14 · 16 · 26 · 30",
    specs: [
      { label: "เนื้อผ้า", value: "คอตตอน 100%" },
      { label: "ไซซ์เด็ก", value: "14 · 16 · 26 · 30" },
      { label: "สี", value: "แดง / ฟ้า" },
    ],
    tags: ["bestseller"],
    driveFile: "528630985_1254071756416748_6802554574379832605_n.jpg",
    updatedAt: "2026-11-05",
    images: [
      {
        src: "/catalog/kids-graphic-tee-1.jpg",
        driveId: "1esQ53l37uRYhOYVwCrE2Re3rgdUnjCFA",
        alt: "เสื้อยืดเด็กสีแดง ลายน้องนักบิน",
      },
    ],
  },
  {
    slug: "flight-windbreaker",
    sku: "PL-AP-006",
    name: "Flight Windbreaker",
    nameEn: "Flight Windbreaker",
    category: "apparel",
    price: null,
    sizes: SIZE_ADULT,
    colors: [{ name: "Black", hex: "#15171A" }],
    summary: "แจ็คเก็ตกันลม สกรีนรุ่นเครื่องบิน A330 / A350 / 777 / 787",
    description:
      "แจ็คเก็ตกันลมคอสูง ซิปหน้าทั้งตัว สกรีนรุ่นเครื่องบินตามที่ต้องการ (A330 · A350 · 777 · 787) พร้อมป้ายแดงที่คอเสื้อ เนื้อผ้าเบา พับเก็บง่าย เหมาะกับห้องโดยสารที่ปรับอากาศเย็น",
    specs: [
      { label: "รุ่นที่สกรีน", value: "A330 · A350 · 777 · 787" },
      { label: "เนื้อผ้า", value: "ไนลอนกันลม" },
      { label: "ไซซ์", value: "S · M · L · XL · 2XL" },
    ],
    tags: ["new"],
    driveFile: "575184560_1330962345394355_2875365466980833138_n.jpg",
    updatedAt: "2026-11-05",
    images: [
      {
        src: "/catalog/flight-windbreaker-1.jpg",
        driveId: "12zsFawbJyeSKUKd_huCZr4ujyvUt_ezz",
        alt: "แจ็คเก็ตกันลม สกรีนรุ่นเครื่องบิน A330 A350 777 787",
      },
      {
        src: "/catalog/flight-windbreaker-2.jpg",
        driveId: "16oHkPT52LTzQxCsT9FhZm8wREb92A6oI",
        alt: "แจ็คเก็ตกันลม สกรีน 777 ด้านหลัง",
      },
      {
        src: "/catalog/flight-windbreaker-3.jpg",
        driveId: "19-teydA82c6xe1MBwazjZn2C2RLDPiqQ",
        alt: "แจ็คเก็ตกันลมโทนดำ สกรีน A350",
      },
    ],
  },
  {
    slug: "instructor-shirt",
    sku: "PL-AP-007",
    name: "Instructor Shirt",
    nameEn: "Instructor Shirt",
    category: "apparel",
    price: null,
    sizes: SIZE_ADULT,
    colors: [{ name: "Black", hex: "#141416" }],
    summary: "เสื้ออินสทรัคเตอร์ สกรีน THAI AIRWAYS · INSTRUCTOR",
    description:
      "เสื้อเชิ้ตแขนสั้นผ้าด้านนอกสีดำ สกรีนข้อความ THAI AIRWAYS และ INSTRUCTOR ที่ตัวเสื้อ ทรงหลวม ใส่ทับเสื้อยืดได้",
    specs: [
      { label: "งานสกรีน", value: "THAI AIRWAYS · INSTRUCTOR" },
      { label: "ทรง", value: "Relaxed fit" },
      { label: "ไซซ์", value: "S · M · L · XL · 2XL" },
    ],
    tags: [],
    driveFile: "657050596_1438055204685068_8225619569059917472_n.jpg",
    updatedAt: "2026-11-05",
    images: [
      {
        src: "/catalog/instructor-shirt-1.jpg",
        driveId: "1-a9zO3Gtaedu9gKso_-tm56GORx_kCgL",
        alt: "เสื้ออินสทรัคเตอร์สีดำ สกรีน INSTRUCTOR",
      },
    ],
  },

  /* ------------------------------------------------------------------- bags */
  {
    slug: "a330-tote",
    sku: "PL-BG-001",
    name: "A330/350 Tote",
    nameEn: "A330/350 Tote",
    category: "bags",
    price: null,
    colors: [{ name: "Navy", hex: "#1D2742" }],
    summary: "กระเป๋าแคนวาส oversized สกรีน A330/350 + โลโก้ PILOT LIBRARY",
    description:
      "กระเป๋าผ้าแคนวาสทรงใหญ่ สกรีน “A330/350” พร้อมโลโก้ PILOT LIBRARY สายไหล่ปรับความยาวได้ มีช่องซิปด้านใน ใส่ของได้จุ ใช้เป็นกระเป๋าถือขึ้นเครื่องได้",
    specs: [
      { label: "เนื้อผ้า", value: "แคนวาสหนา" },
      { label: "สาย", value: "สายไหล่ปรับได้" },
      { label: "รายละเอียด", value: "ซิปด้านใน + ป้ายหนัง" },
    ],
    tags: ["bestseller"],
    driveFile: "497586883_1192421389248452_6069975834229068751_n.jpg",
    updatedAt: "2026-11-05",
    images: [
      {
        src: "/catalog/a330-tote-1.jpg",
        driveId: "1VqJWiz9O0s5RQpFNRK4iuUmxIaUzgSiK",
        alt: "กระเป๋าโท้ท A330/350 สกรีน PILOT LIBRARY",
      },
    ],
  },
  {
    slug: "canvas-tote-brown",
    sku: "PL-BG-002",
    name: "Canvas Tote · Brown",
    nameEn: "Canvas Tote — Brown",
    category: "bags",
    price: 150,
    sizes: SIZE_BAG,
    colors: [{ name: "Brown", hex: "#4A3527" }],
    summary: "กระเป๋าผ้าดิบสีน้ำตาล มี 3 ไซซ์",
    description:
      "กระเป๋าผ้าดิบสีน้ำตาล ปัก/สกรีนลายน้องนักบินพร้อมข้อความ “#ไทยนี้รักสงบ” มีหูหิ้วแข็งแรง พับเก็บง่าย มีสามขนาดให้เลือก",
    specs: [
      { label: "เนื้อผ้า", value: "ผ้าดิบ Cotton canvas" },
      { label: "ไซซ์", value: "S · M · L" },
      { label: "งานปัก", value: "ปักลายน้องนักบิน" },
    ],
    tags: ["bestseller"],
    driveFile: "528042860_1254071709750086_1175419260948016847_n.jpg",
    updatedAt: "2026-11-05",
    images: [
      {
        src: "/catalog/canvas-tote-brown-1.jpg",
        driveId: "13R4E0J8zAI6MMCeg1TvAAcCHGhzDWOIl",
        alt: "กระเป๋าผ้าดิบสีน้ำตาล ปักลายน้องนักบิน",
      },
    ],
  },
  {
    slug: "canvas-tote-tan",
    sku: "PL-BG-003",
    name: "Canvas Tote · Tan",
    nameEn: "Canvas Tote — Tan",
    category: "bags",
    price: 300,
    sizes: SIZE_BAG,
    colors: [{ name: "Tan", hex: "#B79A6B" }],
    summary: "กระเป๋าผ้าดิบสีน้ำตาลอ่อน พร้อมช่องด้านหน้า",
    description:
      "กระเป๋าผ้าดิบไซซ์ใหญ่ สีน้ำตาลอ่อน มีช่องด้านหน้าและหูหิ้วทรงกลม ปักลายน้องนักบิน “#ไทยนี้รักสงบ” เนื้อผ้าหนาพอตัว ตั้งทรงได้",
    specs: [
      { label: "เนื้อผ้า", value: "ผ้าดิบ Cotton canvas" },
      { label: "รายละเอียด", value: "ช่องด้านหน้า + หูหิ้วกลม" },
      { label: "ไซซ์", value: "S · M · L" },
    ],
    tags: [],
    driveFile: "528466654_1254071723083418_5188366281368163166_n.jpg",
    updatedAt: "2026-11-05",
    images: [
      {
        src: "/catalog/canvas-tote-tan-1.jpg",
        driveId: "1RJYksamxpAfqj43cOh3WNhxBI601vjhI",
        alt: "กระเป๋าผ้าดิบสีน้ำตาลอ่อน ปักลายน้องนักบิน",
      },
    ],
  },
  {
    slug: "jute-christmas-tote",
    sku: "PL-BG-004",
    name: "Jute Christmas Tote",
    nameEn: "Jute Christmas Tote",
    category: "bags",
    price: null,
    colors: [{ name: "Natural", hex: "#B49B72" }],
    summary: "กระเป๋ากระสอบ Limited ลาย Merry Christmas",
    description:
      "กระเป๋ากระสอบลาย Merry Christmas พิมพ์ภาพทีมงานการบินร่วมฉลองคริสต์มาส เหมาะเป็นของขวัญเทศกาล มีหูหิ้วผ้าฝ้ายหนานุ่ม",
    specs: [
      { label: "เนื้อผ้า", value: "กระสอบป่าน Jute" },
      { label: "งานพิมพ์", value: "พิมพ์ลาย Merry Christmas" },
      { label: "โอกาส", value: "ของขวัญเทศกาล" },
    ],
    tags: ["limited"],
    driveFile: "484183055_1146102963880295_3369660361965284564_n.jpg",
    updatedAt: "2026-11-05",
    images: [
      {
        src: "/catalog/jute-christmas-tote-1.jpg",
        driveId: "1Ji91P8hJ78qsb1pIyv7xtuL4PswIqlh2",
        alt: "กระเป๋ากระสอบลาย Merry Christmas",
      },
    ],
  },
  {
    slug: "foldable-tote-pink",
    sku: "PL-BG-005",
    name: "Foldable Tote · Pink",
    nameEn: "Foldable Tote — Pink",
    category: "bags",
    price: null,
    colors: [{ name: "Pink", hex: "#E8A9BE" }],
    summary: "กระเป๋าพับได้ ลายน้องนักบินสีชมพู",
    description:
      "กระเป๋าผ้าแบบพับได้ น้ำหนักเบา ลายน้องนักบินบนพื้นชมพู พับเก็บเป็นก้อนเล็กได้ ใช้แทนถุงพลาสติกได้ทุกวัน",
    specs: [
      { label: "รูปแบบ", value: "พับเก็บได้ (Foldable)" },
      { label: "งานพิมพ์", value: "พิมพ์ลายน้องนักบิน" },
      { label: "น้ำหนัก", value: "เบา พกพาง่าย" },
    ],
    tags: ["eco"],
    driveFile: "655603588_1438055338018388_9076850822480323574_n.jpg",
    updatedAt: "2026-11-05",
    images: [
      {
        src: "/catalog/pink-foldable-tote-1.jpg",
        driveId: "1Vb3-iuWJs_mRHy8Hk4riAF6QxZ3ugU49",
        alt: "กระเป๋าพับได้สีชมพู ลายน้องนักบิน",
      },
    ],
  },
  {
    slug: "airbus-briefcase",
    sku: "PL-BG-006",
    name: "AIRBUS Briefcase",
    nameEn: "AIRBUS Briefcase",
    category: "bags",
    price: null,
    colors: [{ name: "Black", hex: "#17191C" }],
    summary: "กระเป๋าเอกสาร สายพาย AIRBUS ติดป้ายห้อย",
    description:
      "กระเป๋าเอกสารผ้าใบสีดำ สายสะพายสกรีน AIRBUS มีช่องซิปหลายช่อง ใส่แล็ปท็อปได้ พร้อมป้ายห้อยผ้าสกรีน Airbus",
    specs: [
      { label: "ช่องใส่ของ", value: "ช่องแล็ปท็อป + ซิปด้านหน้า" },
      { label: "สายสะพาย", value: "สกรีน AIRBUS" },
      { label: "รายละเอียด", value: "ป้ายห้อยผ้า + หัวซิปโลหะ" },
    ],
    tags: [],
    driveFile: "683186527_1464489682041620_5110828255217481106_n.jpg",
    updatedAt: "2026-11-05",
    images: [
      {
        src: "/catalog/airbus-briefcase-1.jpg",
        driveId: "1sXYxBOkmfNmmoqTd8rwp1K8RsDije747",
        alt: "กระเป๋าเอกสาร AIRBUS สีดำ",
      },
    ],
  },
  {
    slug: "a380-travel-set",
    sku: "PL-BG-007",
    name: "A380 Travel Set",
    nameEn: "A380 Travel Set",
    category: "bags",
    price: null,
    colors: [{ name: "Black", hex: "#151719" }],
    summary: "ชุดกระเป๋าเดินทาง A380 กระเป๋าใส่ของ + กระเป๋าล้อลาก",
    description:
      "เซ็ตกระเป๋าเดินทางสำหรับลูกเรือ ประกอบด้วยกระเป๋าใส่ของพร้อมสายสะพายสกรีน AIRBUS 380 และกระเป๋าล้อลากที่ใส่ชุดนักบินได้ พร้อมป้ายห้อยและสายรัด",
    specs: [
      { label: "ในเซ็ต", value: "กระเป๋าถือ + กระเป๋าล้อลาก" },
      { label: "งานสกรีน", value: "AIRBUS 380" },
      { label: "การใช้งาน", value: "เดินทาง / ขึ้นเครื่อง" },
    ],
    tags: ["new"],
    driveFile: "656898514_1438055331351722_5335330012654399751_n.jpg",
    updatedAt: "2026-11-05",
    images: [
      {
        src: "/catalog/a380-travel-set-1.jpg",
        driveId: "1gkB7G46KlXn88v7HH4G1_gifvjxKE8Lw",
        alt: "ชุดกระเป๋าเดินทาง A380 พร้อมหมวกนักบิน",
      },
    ],
  },
  {
    slug: "a350-backpack",
    sku: "PL-BG-008",
    name: "A350 Backpack",
    nameEn: "A350 Backpack",
    category: "bags",
    price: null,
    colors: [{ name: "Black", hex: "#141618" }],
    summary: "เป้สะพายหลัง A350 สกรีนลาย cockpit",
    description:
      "เป้สะพายหลังผ้าใบสีดำ สกรีนลาย A350 ด้านหลัง เนื้อผ้าหนาทน ช่องใส่ของหลากหลาย เหมาะกับการเดินทางระยะสั้น",
    specs: [
      { label: "งานสกรีน", value: "A350 + ลาย cockpit" },
      { label: "ช่องใส่ของ", value: "ช่องหลัก + ช่องหน้าซิป" },
      { label: "รูปแบบ", value: "สะพายหลัง" },
    ],
    tags: [],
    driveFile: "482031626_1145477453942846_2225670194872519231_n.jpg",
    updatedAt: "2026-11-05",
    images: [
      {
        src: "/catalog/backpack-a350-1.jpg",
        driveId: "1ZFP0lpUow44cdNn0K529AIPCwjRQJdRu",
        alt: "เป้สะพายหลัง A350 สกรีนลาย cockpit",
      },
    ],
  },

  /* ------------------------------------------------------------ accessories */
  {
    slug: "cabin-crew-lanyard",
    sku: "PL-AC-001",
    name: "Cabin Crew Lanyard",
    nameEn: "Cabin Crew Lanyard",
    category: "accessories",
    price: null,
    colors: [
      { name: "Purple", hex: "#7A6BA8" },
      { name: "Red", hex: "#C0392B" },
      { name: "Pink", hex: "#E5A0B8" },
      { name: "Black", hex: "#1B1B1E" },
    ],
    summary: "สายคล้องบัตร CABIN CREW พร้อมจี้ห้อยน้องนักบิน",
    description:
      "สายคล้องบัตรทอตัวอักษร CABIN CREW พร้อมแถบริบบิ้นสีทองแดง เหลือบเงิน และจี้ห้อยอะคริลิกน้องนักบิน หัวขอเกี่ยวโลหะแบบหมุนได้",
    specs: [
      { label: "เนื้อสาย", value: "ผ้าทอ (Woven)" },
      { label: "หัวขอเกี่ยว", value: "โลหะหมุนได้ 360°" },
      { label: "ของแถม", value: "จี้อะคริลิกน้องนักบิน" },
    ],
    tags: ["bestseller"],
    driveFile: "484088423_1145481280609130_6948918181566781764_n.jpg",
    updatedAt: "2026-11-05",
    images: [
      {
        src: "/catalog/cabin-crew-lanyard-1.jpg",
        driveId: "1FBvhXnG9gryECvvloiKJ_dtkvakCB7oU",
        alt: "สายคล้องบัตร CABIN CREW พร้อมจี้น้องนักบิน",
      },
    ],
  },
  {
    slug: "airbus-id-lanyard",
    sku: "PL-AC-002",
    name: "AIRBUS ID Lanyard",
    nameEn: "AIRBUS ID Lanyard",
    category: "accessories",
    price: null,
    colors: [{ name: "Black", hex: "#17181B" }],
    summary: "สายคล้องบัตร AIRBUS พร้อมซองบัตรหนัง PU",
    description:
      "สายคล้องบัตรสกรีน AIRBUS พร้อมซองใส่บัตรหนัง PU กันน้ำ มีช่องบัตรและซิปด้านหลัง ใช้กับบัตรพนักงานหรือบัตรผ่านสนามบิน",
    specs: [
      { label: "ซองบัตร", value: "หนัง PU + ช่องซิป" },
      { label: "งานสกรีน", value: "AIRBUS" },
      { label: "หัวขอเกี่ยว", value: "โลหะแบบหมุน" },
    ],
    tags: [],
    driveFile: "655165235_1438055244685064_5118437019621173833_n.jpg",
    updatedAt: "2026-11-05",
    images: [
      {
        src: "/catalog/airbus-id-lanyard-1.jpg",
        driveId: "101nWEHyOrTYAf2uGK-cMh5xtxOscLupt",
        alt: "สายคล้องบัตร AIRBUS พร้อมซองบัตรหนัง",
      },
    ],
  },
  {
    slug: "woven-key-tag",
    sku: "PL-AC-003",
    name: "Woven Key Tag",
    nameEn: "Woven Key Tag",
    category: "accessories",
    price: null,
    colors: [
      { name: "Red", hex: "#C0392B" },
      { name: "Black", hex: "#191A1D" },
    ],
    summary: "ป้ายห้อยกุญแจผ้าทอ CAPTAIN / PILOT / CABIN CREW",
    description:
      "ป้ายห้อยกุญแจผ้าทอ ตัวอักษรและแถบยศ สกรีนแบบทอ สีคมชัด หัวขอเกี่ยวโลหะแบบสปริง เหมาะกับกระเป๋าเดินทางหรือใช้ห้อยบัตร",
    specs: [
      { label: "แบบ", value: "A350 XWB · CAPTAIN · CABIN CREW · PILOT" },
      { label: "เนื้อสาย", value: "ผ้าทอ" },
      { label: "หัวขอเกี่ยว", value: "โลหะสปริง" },
    ],
    tags: ["bestseller"],
    driveFile: "482031626_1145477453942846_2225670194872519231_n.jpg",
    updatedAt: "2026-11-05",
    images: [
      {
        src: "/catalog/woven-key-tag-1.jpg",
        driveId: "1ZFP0lpUow44cdNn0K529AIPCwjRQJdRu",
        alt: "ป้ายห้อยกุญแจผ้าทอ CAPTAIN PILOT CABIN CREW",
      },
    ],
  },
  {
    slug: "airbus-card-wallet",
    sku: "PL-AC-004",
    name: "AIRBUS Card Wallet",
    nameEn: "AIRBUS Card Wallet",
    category: "accessories",
    price: null,
    colors: [
      { name: "Red", hex: "#C0392B" },
      { name: "Brown", hex: "#6B4A2F" },
      { name: "Cream", hex: "#E8D9BE" },
      { name: "Navy", hex: "#1D2A4A" },
      { name: "Orange", hex: "#D9702B" },
      { name: "Yellow", hex: "#E7C63A" },
      { name: "Green", hex: "#2F6B4F" },
      { name: "Sky", hex: "#4C8FBF" },
      { name: "Black", hex: "#17181B" },
      { name: "Grey", hex: "#8B8D90" },
    ],
    summary: "ซองใส่บัตรหนัง PU สกรีน AIRBUS มี 10 สี",
    description:
      "ซองใส่บัตรหนัง PU สกรีนโลโก้ AIRBUS ช่องบัตรแบบสอด พร้อมห่วงคล้องบัตร มีให้เลือกสิบสี ใช้คู่กับสายคล้องบัตรของเราได้พอดี",
    specs: [
      { label: "เนื้อวัสดุ", value: "หนัง PU" },
      { label: "สี", value: "10 สี" },
      { label: "ช่องบัตร", value: "แบบสอด + ห่วงคล้อง" },
    ],
    tags: [],
    driveFile: "483485882_1146111480546110_292755356123117523_n.jpg",
    updatedAt: "2026-11-05",
    images: [
      {
        src: "/catalog/airbus-card-wallet-1.jpg",
        driveId: "1rLCf7GsG46IX--bWvSWsfizPnNHNnO9x",
        alt: "ซองใส่บัตรหนัง PU สกรีน AIRBUS หลายสี",
      },
    ],
  },
  {
    slug: "mesh-zip-pouch",
    sku: "PL-AC-005",
    name: "Mesh Zip Pouch",
    nameEn: "Mesh Zip Pouch",
    category: "accessories",
    price: 65,
    colors: [
      { name: "Navy", hex: "#2A3B6B" },
      { name: "Olive", hex: "#6B6A3A" },
      { name: "Lime", hex: "#A8C33A" },
    ],
    summary: "กระเป๋าใส่ของเมชซิป สกรีนลายน้องนักบิน",
    description:
      "กระเป๋าเมชซิปขนาดพกพา ใช้ใส่เครื่องเขียน สายชาร์จ หรือของชิ้นเล็ก สกรีนลายน้องนักบินพร้อมข้อความ “#ไทยนี้รักสงบ” มีสามสี",
    specs: [
      { label: "เนื้อวัสดุ", value: "ผ้าเมช + ซิป" },
      { label: "สี", value: "กรม / เขียวมะกอก / เขียวมะนาว" },
      { label: "การใช้งาน", value: "อุปกรณ์เล็ก / เครื่องเขียน" },
    ],
    tags: ["eco"],
    driveFile: "527236229_1254071713083419_8177083048420893051_n.jpg",
    updatedAt: "2026-11-05",
    images: [
      {
        src: "/catalog/zip-pouch-set-1.jpg",
        driveId: "1djg-8W5EGEwm1bC-vi__9Yn7w18cdRFY",
        alt: "กระเป๋าเมชซิปสามสี ลายน้องนักบิน",
      },
    ],
  },
  {
    slug: "airbus-tumbler",
    sku: "PL-AC-006",
    name: "AIRBUS Tumbler",
    nameEn: "AIRBUS Tumbler",
    category: "accessories",
    price: null,
    colors: [
      { name: "Ivory", hex: "#EFE9DD" },
      { name: "Slate", hex: "#8A94A0" },
      { name: "Black", hex: "#16181A" },
    ],
    summary: "แก้วเก็บอุณหภูมิสกรีน AIRBUS พร้อมสายหิ้ว",
    description:
      "แก้วเก็บอุณหภูมิสแตนเลสสองชั้น ฝาปิดสนิท สกรีน AIRBUS ตัวใหญ่ พร้อมสายหิ้วผ้าและฝาแบบมีหูหิ้ว เหมาะกับกาแฟระหว่างเที่ยวบิน",
    specs: [
      { label: "วัสดุ", value: "สแตนเลสสองชั้น" },
      { label: "จุดเด่น", value: "เก็บอุณหภูมิ + ฝากันรั่ว" },
      { label: "อุปกรณ์", value: "สายหิ้วผ้า" },
    ],
    tags: ["new"],
    driveFile: "482031626_1145477453942846_2225670194872519231_n.jpg",
    updatedAt: "2026-11-05",
    images: [
      {
        src: "/catalog/airbus-tumbler-1.jpg",
        driveId: "1ZFP0lpUow44cdNn0K529AIPCwjRQJdRu",
        alt: "แก้วเก็บอุณหภูมิ AIRBUS สามสี",
      },
    ],
  },

  /* -------------------------------------------------------------- souvenirs */
  {
    slug: "thai-tail-keyring",
    sku: "PL-SV-001",
    name: "THAI Tail Keyring",
    nameEn: "THAI Tail Keyring",
    category: "souvenirs",
    price: null,
    summary: "พวงกุญแจหางเครื่องบิน THAI พร้อมฐานตั้ง",
    description:
      "พวงกุญแจจำลองหางเครื่องบิน THAI สีม่วง-ทอง พร้อมฐานตั้งสำหรับวางบนโต๊ะทำงาน มาพร้อมห่วงกุญแจสแตนเลส",
    specs: [
      { label: "งานพิมพ์", value: "โลโก้ THAI สองหน้า" },
      { label: "อุปกรณ์", value: "ห่วงกุญแจ + ฐานตั้ง" },
      { label: "ขนาด", value: "พกพา" },
    ],
    tags: ["bestseller"],
    driveFile: "656791001_1438055314685057_7564044512417539092_n.jpg",
    updatedAt: "2026-11-05",
    images: [
      {
        src: "/catalog/thai-tail-keyring-1.jpg",
        driveId: "1Y1VKYHLkCfiAuQEktasIBdF7JDzCG1Bo",
        alt: "พวงกุญแจหางเครื่องบิน THAI บนฐานตั้ง",
      },
    ],
  },
  {
    slug: "acrylic-keychain",
    sku: "PL-SV-002",
    name: "Acrylic Keychain",
    nameEn: "Acrylic Keychain",
    category: "souvenirs",
    price: null,
    summary: "พวงกุญแจอะคริลิกน้องนักบิน 3 ดีไซน์",
    description:
      "พวงกุญแจอะคริลิกสองชั้น พิมพ์ลายน้องนักบินพร้อมฉากสนามบิน มีสามดีไซน์ ได้แก่ น้องนักบินหูฟัง หัวมังกร และน้องนักบินยีราฟ",
    specs: [
      { label: "วัสดุ", value: "อะคริลิก 2 ชั้น" },
      { label: "ดีไซน์", value: "3 แบบ" },
      { label: "บรรจุภัณฑ์", value: "การ์ด Pilot Library" },
    ],
    tags: ["new"],
    driveFile: "656939484_1438055171351738_6259475003455416423_n.jpg",
    updatedAt: "2026-11-05",
    images: [
      {
        src: "/catalog/acrylic-keychain-1.jpg",
        driveId: "1lAOgo1wp6Em3Z4BZOF_uB5HHk0DssPOU",
        alt: "พวงกุญแจอะคริลิกน้องนักบินสามแบบ",
      },
    ],
  },
  {
    slug: "resin-aircraft-keychain",
    sku: "PL-SV-003",
    name: "Resin Aircraft Keychain",
    nameEn: "Resin Aircraft Keychain",
    category: "souvenirs",
    price: null,
    summary: "พวงกุญแจเรซิ่นรูปเครื่องบิน หางธงชาติ",
    description:
      "พวงกุญแจเรซิ่นหล่อรูปเครื่องบินพร้อมหางธงชาติไทยและหุ่นนักบินใน cockpit ห่วงโลหะแข็งแรง เหมาะเป็นของฝากจากประเทศไทย",
    specs: [
      { label: "วัสดุ", value: "เรซิ่นหล่อ" },
      { label: "ดีไซน์", value: "Airbus · Boeing · Thai Airways" },
      { label: "ห่วง", value: "โลหะ + เชือกถัก" },
    ],
    tags: [],
    driveFile: "658043763_1438055211351734_2033646974525448576_n.jpg",
    updatedAt: "2026-11-05",
    images: [
      {
        src: "/catalog/resin-aircraft-keychain-1.jpg",
        driveId: "1BxCUmqrFB-wkr9YRXA_5WPhyR_g8Eb6A",
        alt: "พวงกุญแจเรซิ่นรูปเครื่องบิน",
      },
    ],
  },
  {
    slug: "airbus-umbrella-red",
    sku: "PL-SV-004",
    name: "AIRBUS Umbrella · Red",
    nameEn: "AIRBUS Umbrella — Red",
    category: "souvenirs",
    price: null,
    colors: [{ name: "Red", hex: "#B5352F" }],
    summary: "ร่มสนาม AIRBUS กัน UV ตัวใหญ่",
    description:
      "ร่มสนามสีแดงขนาดใหญ่ พิมพ์ลาย AIRBUS สีขาวผิวมัน โครงเหล็กแข็งแรง กันแดดและกันฝนได้ เหมาะกับสนามบินและวันฝนตก",
    specs: [
      { label: "ขนาด", value: "ร่มสนามตัวใหญ่" },
      { label: "งานพิมพ์", value: "AIRBUS" },
      { label: "โครง", value: "เหล็ก 8 คัน" },
    ],
    tags: [],
    driveFile: "496017850_1192418402582084_2310209381700588557_n.jpg",
    updatedAt: "2026-11-05",
    images: [
      {
        src: "/catalog/airbus-umbrella-red-1.jpg",
        driveId: "1R9LAdqMgc10uBTwzvWFLo0vBPaWVQsIU",
        alt: "ร่ม AIRBUS สีแดง",
      },
    ],
  },
  {
    slug: "airbus-boeing-umbrella",
    sku: "PL-SV-005",
    name: "Airbus / Boeing Umbrella",
    nameEn: "Airbus / Boeing Umbrella",
    category: "souvenirs",
    price: null,
    colors: [
      { name: "Navy", hex: "#20293D" },
      { name: "Black", hex: "#16181A" },
    ],
    summary: "ร่มพับได้ สกรีน AIRBUS หรือ BOEING",
    description:
      "ร่มสีเข้มสกรีนลาย AIRBUS หรือ BOEING ตามที่เลือก ด้ามจับแข็งแรง โครงเบา พับเก็บได้ ใส่กระเป๋าเดินทางได้พอดี",
    specs: [
      { label: "แบบ", value: "AIRBUS / BOEING" },
      { label: "รูปแบบ", value: "พับเก็บได้" },
      { label: "งานสกรีน", value: "ตัวอักษรสีขาว" },
    ],
    tags: [],
    driveFile: "496874243_1192418392582085_2860775223893941361_n.jpg",
    updatedAt: "2026-11-05",
    images: [
      {
        src: "/catalog/airbus-boeing-umbrella-1.jpg",
        driveId: "1eGJRaGm9XZ9A6bDwlN43O5jL7A7GIQVZ",
        alt: "ร่ม AIRBUS และ BOEING",
      },
    ],
  },
];

export const PRODUCT_BY_SLUG: Record<string, Product> = Object.fromEntries(
  PRODUCTS.map((p) => [p.slug, p]),
);
