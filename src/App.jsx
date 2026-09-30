import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { auth, db } from "./firebase";
import {
  LayoutDashboard,
  ShoppingCart,
  ClipboardList,
  Utensils,
  CreditCard,
  ChefHat,
  LogOut,
  Plus,
  Minus,
  Trash2,
  Search,
  Bell,
  CheckCircle2,
  XCircle,
  Clock3,
  Receipt,
  Banknote,
  Smartphone,
  Menu as MenuIcon,
  ArrowRight,
  Sparkles,
  Pizza,
  Sandwich,
  CupSoda,
  IceCreamBowl,
  Flame,
  RefreshCw,
  CircleDollarSign,
  PackageCheck,
  CookingPot,
} from "lucide-react";


// ============================================================
// AUTHENTICATION USERS
// ============================================================

const CATEGORIES = [
  "All",
  "Pizza",
  "Specialties",
  "Sides",
  "Burgers",
  "Wings",
  "Wraps",
  "Drinks",
  "Desserts",
  "Deals",
];

const TAX_RATE = 0.05;

const ROLE_NAVIGATION = {
  Manager: [
    { id: "create-order", label: "Create Order", icon: ShoppingCart },
    { id: "orders", label: "All Orders", icon: ClipboardList },
    { id: "menu", label: "Menu", icon: Utensils },
  ],
  Waiter: [
    { id: "orders", label: "Orders", icon: ClipboardList },
  ],
  Receptionist: [
    { id: "payments", label: "Payments", icon: CreditCard },
  ],
  Cook: [
    { id: "kitchen", label: "Kitchen", icon: ChefHat },
  ],
};


// ============================================================
// JAFFA'Z MENU
// ============================================================

const menuItems = [

  // ---------------- PIZZAS ----------------

  {
    id: "pizza-cheese",
    name: "Cheese Lovers",
    category: "Pizza",
    icon: "🍕",
    variants: {
      Small: 500,
      Medium: 850,
      Large: 1200,
      XL: 1850,
    },
  },

  {
    id: "pizza-tikka",
    name: "Chicken Tikka",
    category: "Pizza",
    icon: "🍕",
    variants: {
      Small: 630,
      Medium: 990,
      Large: 1420,
      XL: 2070,
    },
  },

  {
    id: "pizza-fajita",
    name: "Chicken Fajita",
    category: "Pizza",
    icon: "🍕",
    variants: {
      Small: 630,
      Medium: 990,
      Large: 1420,
      XL: 2070,
    },
  },

  {
    id: "pizza-tandoori",
    name: "Chicken Tandoori",
    category: "Pizza",
    icon: "🍕",
    variants: {
      Small: 630,
      Medium: 990,
      Large: 1420,
      XL: 2070,
    },
  },

  {
    id: "pizza-creamy",
    name: "Creamy Pizza",
    category: "Pizza",
    icon: "🍕",
    variants: {
      Small: 690,
      Medium: 1170,
      Large: 1600,
      XL: 2250,
    },
  },

  {
    id: "pizza-supreme",
    name: "Chicken Supreme",
    category: "Pizza",
    icon: "🍕",
    variants: {
      Small: 690,
      Medium: 1170,
      Large: 1600,
      XL: 2250,
    },
  },

  {
    id: "pizza-malai",
    name: "Malai Boti",
    category: "Pizza",
    icon: "🍕",
    variants: {
      Small: 690,
      Medium: 1170,
      Large: 1600,
      XL: 2250,
    },
  },

  {
    id: "pizza-steak",
    name: "Steak Pizza",
    category: "Pizza",
    icon: "🍕",
    variants: {
      Small: 690,
      Medium: 1170,
      Large: 1600,
      XL: 2250,
    },
  },

  {
    id: "pizza-lazania",
    name: "Lazania Pizza",
    category: "Pizza",
    icon: "🍕",
    variants: {
      Small: 730,
      Medium: 1320,
      Large: 1800,
      XL: 2500,
    },
  },

  {
    id: "pizza-behari",
    name: "Behari Kebab",
    category: "Pizza",
    icon: "🍕",
    variants: {
      Small: 730,
      Medium: 1320,
      Large: 1800,
      XL: 2500,
    },
  },

  {
    id: "pizza-bonfire",
    name: "Bonfire Pizza",
    category: "Pizza",
    icon: "🔥",
    variants: {
      Medium: 1320,
      Large: 1800,
      XL: 2500,
    },
  },

  {
    id: "pizza-jaffaz",
    name: "Jaffa'z Special",
    category: "Pizza",
    icon: "⭐",
    variants: {
      Medium: 1320,
      Large: 1800,
      XL: 2500,
    },
  },

  {
    id: "pizza-split",
    name: "Split Pizza On Demand",
    category: "Pizza",
    icon: "🍕",
    variants: {
      Special: 0,
    },
    special: true,
  },


  // ---------------- SPECIALTIES ----------------

  {
    id: "special-grilled-burger",
    name: "Grilled Burger",
    category: "Specialties",
    icon: "🍔",
    price: 470,
  },

  {
    id: "special-mexican-steak",
    name: "Mexican Sauce Chicken Steak",
    category: "Specialties",
    icon: "🥩",
    price: 940,
  },

  {
    id: "special-loaded-fries",
    name: "Loaded Fries",
    category: "Specialties",
    icon: "🍟",
    price: 630,
  },

  {
    id: "special-alfredo",
    name: "Alfredo Pasta",
    category: "Specialties",
    icon: "🍝",
    price: 590,
  },

  {
    id: "special-creamy-pasta",
    name: "Creamy Pasta",
    category: "Specialties",
    icon: "🍝",
    price: 630,
  },

  {
    id: "special-pizza-fries",
    name: "Pizza Fries",
    category: "Specialties",
    icon: "🍟",
    price: 630,
  },

  {
    id: "special-grilled-sandwich",
    name: "Grilled Sandwich",
    category: "Specialties",
    icon: "🥪",
    price: 500,
  },

  {
    id: "special-white-steak",
    name: "White Sauce Chicken Steak",
    category: "Specialties",
    icon: "🥩",
    price: 920,
  },

  {
    id: "special-behari-roll",
    name: "Behari Roll",
    category: "Specialties",
    icon: "🌯",
    price: 390,
  },

  {
    id: "special-pizza-paratha",
    name: "Pizza Paratha",
    category: "Specialties",
    icon: "🥙",
    price: 590,
  },

  {
    id: "special-pizza-sandwich",
    name: "Pizza Sandwich",
    category: "Specialties",
    icon: "🥪",
    price: 520,
  },

  {
    id: "special-tortilla",
    name: "Tortilla Wrap / Crunchy Wrap",
    category: "Specialties",
    icon: "🌯",
    price: 450,
  },


  // ---------------- SIDES ----------------

  {
    id: "fries-regular",
    name: "French Fries",
    category: "Sides",
    icon: "🍟",
    variants: {
      Regular: 280,
      Family: 470,
    },
  },

  {
    id: "fries-masala",
    name: "Masala Fries",
    category: "Sides",
    icon: "🍟",
    variants: {
      Regular: 280,
      Family: 470,
    },
  },

  {
    id: "dip-sauce",
    name: "Dip Sauce",
    category: "Sides",
    icon: "🥫",
    price: 90,
  },

  {
    id: "cheese-slice",
    name: "Cheese Slice",
    category: "Sides",
    icon: "🧀",
    price: 90,
  },


  // ---------------- BURGERS ----------------

  {
    id: "burger-zinger",
    name: "Zinger Burger",
    category: "Burgers",
    icon: "🍔",
    price: 390,
  },

  {
    id: "burger-zinger-tower",
    name: "Zinger Tower Burger",
    category: "Burgers",
    icon: "🍔",
    price: 490,
  },

  {
    id: "burger-mighty-zinger",
    name: "Mighty Zinger",
    category: "Burgers",
    icon: "🍔",
    price: 540,
  },

  {
    id: "burger-patty",
    name: "Patty Burger",
    category: "Burgers",
    icon: "🍔",
    price: 280,
  },

  {
    id: "burger-patty-cheese",
    name: "Patty Cheese Slice Burger",
    category: "Burgers",
    icon: "🍔",
    price: 320,
  },

  {
    id: "burger-grilled",
    name: "Grilled Burger",
    category: "Burgers",
    icon: "🍔",
    price: 470,
  },

  {
    id: "burger-special",
    name: "Jaffa'z Special Burger",
    category: "Burgers",
    icon: "🍔",
    price: 590,
  },


  // ---------------- WINGS / NUGGETS ----------------

  {
    id: "wings-hot",
    name: "Hot Wings",
    category: "Wings",
    icon: "🍗",
    variants: {
      "5 Pieces": 300,
      "10 Pieces": 580,
    },
  },

  {
    id: "wings-baked",
    name: "Baked Wings",
    category: "Wings",
    icon: "🍗",
    variants: {
      "5 Pieces": 320,
      "10 Pieces": 600,
    },
  },

  {
    id: "wings-grilled",
    name: "Grilled Wings",
    category: "Wings",
    icon: "🍗",
    variants: {
      "5 Pieces": 320,
      "10 Pieces": 580,
    },
  },

  {
    id: "nuggets",
    name: "Chicken Nuggets",
    category: "Wings",
    icon: "🍗",
    variants: {
      "5 Pieces": 290,
      "10 Pieces": 540,
    },
  },


  // ---------------- WRAPS ----------------

  {
    id: "wrap-shawarma",
    name: "Shawarma",
    category: "Wraps",
    icon: "🌯",
    price: 220,
  },

  {
    id: "wrap-zinger-shawarma",
    name: "Zinger Shawarma",
    category: "Wraps",
    icon: "🌯",
    price: 360,
  },

  {
    id: "wrap-chicken-cheese",
    name: "Chicken Cheese Shawarma",
    category: "Wraps",
    icon: "🌯",
    price: 280,
  },

  {
    id: "wrap-paratha",
    name: "Paratha Roll",
    category: "Wraps",
    icon: "🌯",
    price: 280,
  },

  {
    id: "wrap-chicken-cheese-paratha",
    name: "Chicken Cheese Paratha Roll",
    category: "Wraps",
    icon: "🌯",
    price: 310,
  },

  {
    id: "wrap-zinger-paratha",
    name: "Zinger Paratha Roll",
    category: "Wraps",
    icon: "🌯",
    price: 370,
  },


  // ---------------- DRINKS ----------------

  {
    id: "drink-lime",
    name: "Fresh Lime",
    category: "Drinks",
    icon: "🍋",
    price: 180,
  },

  {
    id: "drink-reg",
    name: "Cold Drink (Regular)",
    category: "Drinks",
    icon: "🥤",
    price: 70,
  },

  {
    id: "drink-345",
    name: "Cold Drink 345ml",
    category: "Drinks",
    icon: "🥤",
    price: 80,
  },

  {
    id: "drink-tin",
    name: "Tin Pack",
    category: "Drinks",
    icon: "🥤",
    price: 120,
  },

  {
    id: "drink-500",
    name: "Cold Drink 500ml",
    category: "Drinks",
    icon: "🥤",
    price: 120,
  },

  {
    id: "drink-1l",
    name: "Cold Drink 1 Liter",
    category: "Drinks",
    icon: "🥤",
    price: 170,
  },

  {
    id: "drink-1-5l",
    name: "Cold Drink 1.5 Liter",
    category: "Drinks",
    icon: "🥤",
    price: 220,
  },

  {
    id: "water-500",
    name: "Mineral Water 500ml",
    category: "Drinks",
    icon: "💧",
    price: 70,
  },

  {
    id: "water-1-5",
    name: "Mineral Water 1.5 Liter",
    category: "Drinks",
    icon: "💧",
    price: 110,
  },


  // ---------------- DESSERTS ----------------

  {
    id: "dessert-lava",
    name: "Molten Lava with Ice Cream",
    category: "Desserts",
    icon: "🍫",
    price: 590,
  },

  {
    id: "dessert-ice-1",
    name: "Jaffa'z Ice Cream - 1 Scoop",
    category: "Desserts",
    icon: "🍨",
    price: 110,
  },

  {
    id: "dessert-ice-2",
    name: "Jaffa'z Ice Cream - 2 Scoops",
    category: "Desserts",
    icon: "🍨",
    price: 200,
  },


  // ---------------- REGULAR DEALS ----------------

  {
    id: "deal-1",
    name: "Regular Deal 1",
    category: "Deals",
    icon: "🎁",
    description: "1 Zinger Burger + 1 Regular Drink",
    price: 430,
  },

  {
    id: "deal-2",
    name: "Regular Deal 2",
    category: "Deals",
    icon: "🎁",
    description: "1 Patty Burger + 1 Regular Drink",
    price: 310,
  },

  {
    id: "deal-3",
    name: "Regular Deal 3",
    category: "Deals",
    icon: "🎁",
    description: "1 Zinger Burger + 1 Regular Drink + Fries",
    price: 640,
  },

  {
    id: "deal-4",
    name: "Regular Deal 4",
    category: "Deals",
    icon: "🎁",
    description: "1 Zinger Roll + 1 Regular Drink + Fries",
    price: 600,
  },

  {
    id: "deal-5",
    name: "Regular Deal 5",
    category: "Deals",
    icon: "🎁",
    description: "5 Hot Wings + 1 Regular Drink",
    price: 330,
  },

  {
    id: "deal-6",
    name: "Regular Deal 6",
    category: "Deals",
    icon: "🎁",
    description: "10 Hot Wings + 1 Regular Drink",
    price: 610,
  },

  {
    id: "deal-7",
    name: "Regular Deal 7",
    category: "Deals",
    icon: "🎁",
    description: "1 Zinger Burger + 5 Hot Wings + Fries + 1 Regular Drink",
    price: 910,
  },

  {
    id: "deal-8",
    name: "Deal 8",
    category: "Deals",
    icon: "🎁",
    description: "5 Zinger Burgers + 1 Family Fries + 1.5 Liter Drink",
    price: 2430,
  },

  {
    id: "deal-9",
    name: "Twin Deal",
    category: "Deals",
    icon: "🎁",
    description: "2 Zinger Burgers + Fries + 500ml Drink",
    price: 1020,
  },

  {
    id: "deal-10",
    name: "Deal 10",
    category: "Deals",
    icon: "🎁",
    description: "1 Pizza Paratha + 1 Regular Drink",
    price: 620,
  },

  {
    id: "deal-11",
    name: "Deal 11",
    category: "Deals",
    icon: "🎁",
    description: "1 Grilled Burger + 1 Regular Drink",
    price: 500,
  },

  {
    id: "deal-12",
    name: "Deal 12",
    category: "Deals",
    icon: "🎁",
    description: "2 Grilled Burgers + 500ml Drink",
    price: 1000,
  },

  {
    id: "deal-13",
    name: "Deal 13",
    category: "Deals",
    icon: "🎁",
    description: "1 Club Sandwich + 1 Regular Drink + Fries",
    price: 680,
  },

  {
    id: "deal-14",
    name: "Deal 14",
    category: "Deals",
    icon: "🎁",
    description: "1 Tortilla / Crunchy Wrap + 1 Regular Drink + Fries",
    price: 730,
  },


  // ---------------- BIG DEALS ----------------

  {
    id: "big-deal-1",
    name: "Big Deal 1",
    category: "Deals",
    icon: "🔥",
    description: "2 Small Pizza + 1 Liter Drink",
    price: 1280,
  },

  {
    id: "big-deal-2",
    name: "Big Deal 2",
    category: "Deals",
    icon: "🔥",
    description: "1 Medium Pizza + 10 Hot Wings + 1 Liter Drink",
    price: 1600,
  },

  {
    id: "big-deal-3",
    name: "Big Deal 3",
    category: "Deals",
    icon: "🔥",
    description: "2 Medium Pizza + 1 Liter Drink",
    price: 2040,
  },

  {
    id: "big-deal-4",
    name: "Big Deal 4",
    category: "Deals",
    icon: "🔥",
    description: "1 Large Pizza + 15 Hot Wings + 1.5 Liter Drink",
    price: 2370,
  },

  {
    id: "big-deal-5",
    name: "Big Deal 5",
    category: "Deals",
    icon: "🔥",
    description: "1 Large Pizza + 1 Medium Pizza + 1.5 Liter Drink",
    price: 2520,
  },

  {
    id: "big-deal-6",
    name: "Big Deal 6",
    category: "Deals",
    icon: "🔥",
    description: "2 Large Pizza + 1.5 Liter Drink",
    price: 2950,
  },
];


// ============================================================
// HELPERS
// ============================================================

const formatPrice = (price) => {
  return `Rs. ${Number(price).toLocaleString()}`;
};

const statusInfo = {
  WAITING_FOR_WAITER: {
    label: "Waiting for Waiter",
    className: "status-waiting",
  },

  WAITING_FOR_RECEPTIONIST: {
    label: "Waiting for Payment",
    className: "status-payment",
  },

  PAID_WAITING_FOR_COOK: {
    label: "Waiting for Kitchen",
    className: "status-kitchen",
  },

  PREPARING: {
    label: "Preparing",
    className: "status-preparing",
  },

  READY: {
    label: "Ready",
    className: "status-ready",
  },

  COMPLETED: {
    label: "Completed",
    className: "status-completed",
  },

  CANCELLED: {
    label: "Cancelled",
    className: "status-cancelled",
  },
};

const isPaymentPending = (order) =>
  !order.paymentMethod &&
  order.status !== "WAITING_FOR_WAITER" &&
  order.status !== "CANCELLED";

const KITCHEN_QUEUE_STATUSES = new Set([
  "PAID_WAITING_FOR_COOK",
  "PREPARING",
  "READY",
]);

const normalizeOrder = (snapshot) => {
  const data = snapshot.data();
  const createdAt = data.createdAt?.toDate
    ? data.createdAt.toDate().toISOString()
    : data.createdAt || new Date().toISOString();

  return {
    ...data,
    id: snapshot.id,
    displayId: data.displayId || snapshot.id.slice(-6).toUpperCase(),
    createdAt,
  };
};


// ============================================================
// MAIN APP
// ============================================================

export default function App() {

  const [user, setUser] = useState(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [activePage, setActivePage] = useState("dashboard");

  const [orders, setOrders] = useState([]);
  const [apiReady, setApiReady] = useState(false);
  const refreshOrders = useCallback(async () => {
    if (!auth.currentUser) throw new Error("Please sign in again.");
    const result = await getDocs(query(collection(db, "orders"), orderBy("createdAt", "desc")));
    setOrders(result.docs.map(normalizeOrder));
  }, []);

  useEffect(() => {
    let current = true;
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!current) return;

      if (!firebaseUser) {
        setUser(null);
        setOrders([]);
        setApiReady(true);
        return;
      }

      try {
        setApiReady(false);
        const staffSnapshot = await getDoc(doc(db, "staff", firebaseUser.uid));
        if (!staffSnapshot.exists()) {
          throw new Error("Your account has no staff profile yet. Ask the manager to set it up.");
        }
        const staff = staffSnapshot.data();
        const roles = {
          manager: "Manager",
          waiter: "Waiter",
          receptionist: "Receptionist",
          cook: "Cook",
        };
        const role = roles[String(staff.role || "").toLowerCase()];
        if (!role || staff.active === false) {
          throw new Error("Your staff account is disabled or has an invalid role.");
        }
        if (!current) return;
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          username: staff.username || firebaseUser.email || firebaseUser.uid,
          name: staff.name || firebaseUser.email || "Staff member",
          role,
        });
        setActivePage("dashboard");
        setLoginError("");
      } catch (error) {
        if (!current) return;
        await signOut(auth);
        setUser(null);
        setLoginError(error.message || "Could not connect to the POS server.");
      } finally {
        if (current) setApiReady(true);
      }
    });

    return () => {
      current = false;
      unsubscribe();
    };
  }, []);

  const [cart, setCart] = useState([]);
  const [tableNumber, setTableNumber] = useState("");
  const [requiresWaiter, setRequiresWaiter] = useState(false);
  const [customPrice, setCustomPrice] = useState("");

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");

  const [selectedProduct, setSelectedProduct] = useState(null);

  const [notification, setNotification] = useState("");

  // ==========================================================
  // LOGIN
  // ==========================================================

  const login = useCallback(async (e) => {

    e.preventDefault();

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      setLoginError("");
      setEmail("");
      setPassword("");
      setActivePage("dashboard");
    } catch (error) {
      const messages = {
        "auth/invalid-credential": "Email or password is incorrect.",
        "auth/invalid-email": "Enter a valid email address.",
        "auth/too-many-requests": "Too many attempts. Wait a while, then try again.",
      };
      setLoginError(messages[error.code] || error.message || "Could not sign in.");
    }
  }, [email, password, setActivePage]);


  // ==========================================================
  // LOGOUT
  // ==========================================================

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
      setCart([]);
      setActivePage("dashboard");
      setLoginError("");
    } catch (error) {
      setLoginError(error.message || "Could not log out. Please try again.");
    }
  }, [setActivePage]);


  // ==========================================================
  // NOTIFICATION
  // ==========================================================

  const notificationTimer = useRef(null);

  useEffect(() => {
    return () => {
      if (notificationTimer.current) {
        clearTimeout(notificationTimer.current);
      }
    };
  }, []);

  const showNotification = useCallback((message) => {
    setNotification(message);

    if (notificationTimer.current) {
      clearTimeout(notificationTimer.current);
    }

    notificationTimer.current = setTimeout(() => {
      setNotification("");
      notificationTimer.current = null;
    }, 3000);
  }, []);

  useEffect(() => {
    if (!user) return undefined;

    const ordersQuery = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    return onSnapshot(
      ordersQuery,
      (snapshot) => setOrders(snapshot.docs.map(normalizeOrder)),
      (error) => {
        console.error("Live order updates failed:", error);
        showNotification("Could not receive live order updates. Check your connection.");
      }
    );
  }, [showNotification, user]);

  const waiterQueueOrders = useMemo(
    () => orders.filter((order) => order.status === "WAITING_FOR_WAITER"),
    [orders]
  );
  const managerAttentionOrders = useMemo(
    () => orders.filter((order) =>
      order.status === "WAITING_FOR_WAITER" ||
      (user?.role === "Manager" && order.status === "WAITING_FOR_RECEPTIONIST")
    ),
    [orders, user?.role]
  );
  const pendingPaymentOrders = useMemo(
    () => orders.filter(isPaymentPending),
    [orders]
  );
  const kitchenQueueOrders = useMemo(
    () => orders.filter((order) => KITCHEN_QUEUE_STATUSES.has(order.status)),
    [orders]
  );


  // ==========================================================
  // FILTER MENU
  // ==========================================================

  const filteredMenu = useMemo(() => {

    return menuItems.filter((item) => {

      const categoryMatch =
        selectedCategory === "All" ||
        item.category === selectedCategory;

      const searchMatch =
        item.name.toLowerCase().includes(search.trim().toLowerCase());

      return categoryMatch && searchMatch;
    });

  }, [selectedCategory, search]);


  // ==========================================================
  // CART
  // ==========================================================

  const addToCart = useCallback((item, variant = null) => {

    if (item.special) {
      setSelectedProduct(item);
      setCustomPrice("");
      return;
    }

    const price = variant
      ? item.variants[variant]
      : item.price;

    if (!price) {
      return;
    }

    const cartId = `${item.id}-${variant || "default"}`;

    setCart((currentCart) => {

      const existing = currentCart.find(
        (cartItem) => cartItem.cartId === cartId
      );

      if (existing) {

        return currentCart.map((cartItem) =>
          cartItem.cartId === cartId
            ? {
                ...cartItem,
                quantity: cartItem.quantity + 1,
              }
            : cartItem
        );
      }

      return [
        ...currentCart,
        {
          cartId,
          id: item.id,
          name: item.name,
          price,
          variant,
          quantity: 1,
          icon: item.icon,
        },
      ];
    });

    setSelectedProduct(null);

    showNotification(`${item.name} added to order`);
  }, [showNotification]);

  const addSpecialItem = useCallback((event) => {
    event.preventDefault();
    const price = Number(customPrice);
    if (!Number.isFinite(price) || price <= 0) {
      showNotification("Enter a price greater than zero.");
      return;
    }
    addToCart({ ...selectedProduct, special: false, price }, "Special");
  }, [addToCart, customPrice, selectedProduct, showNotification]);


  const increaseQuantity = useCallback((cartId) => {

    setCart((currentCart) =>
      currentCart.map((item) =>
        item.cartId === cartId
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item
      )
    );
  }, []);


  const decreaseQuantity = useCallback((cartId) => {

    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.cartId === cartId
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }, []);


  const removeFromCart = useCallback((cartId) => {

    setCart((currentCart) =>
      currentCart.filter((item) => item.cartId !== cartId)
    );
  }, []);


  // ==========================================================
  // TOTALS
  // ==========================================================

  const { subtotal, tax, total } = useMemo(() => {
    const nextSubtotal = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const nextTax = Math.round(nextSubtotal * TAX_RATE);

    return {
      subtotal: nextSubtotal,
      tax: nextTax,
      total: nextSubtotal + nextTax,
    };
  }, [cart]);


  // ==========================================================
  // CREATE ORDER
  // ==========================================================

  const createOrder = useCallback(async () => {

    if (cart.length === 0) {
      showNotification("Please add items first.");
      return;
    }

    const orderDraft = {
      table:
        tableNumber.trim() ||
        "Takeaway",

      items: cart,

      subtotal,

      tax,

      total,

      requiresWaiter,

      status: requiresWaiter
        ? "WAITING_FOR_WAITER"
        : "WAITING_FOR_RECEPTIONIST",

      createdBy: user.username,

      waiter: null,

      paymentMethod: null,

      createdAt: new Date().toISOString(),

    };

    let orderId;
    try {
      const orderRef = doc(collection(db, "orders"));
      orderId = orderRef.id;
      await setDoc(orderRef, {
        ...orderDraft,
        id: orderRef.id,
        displayId: orderRef.id.slice(-6).toUpperCase(),
        createdByUid: user.uid,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Create order failed:", error);
      showNotification("Could not create the order. Check your connection and staff permissions.");
      return;
    }

    setCart([]);
    setTableNumber("");
    setRequiresWaiter(false);

    showNotification(
      requiresWaiter
        ? `Order #${orderId.slice(-6).toUpperCase()} sent to the waiter`
        : `Order #${orderId.slice(-6).toUpperCase()} sent to the payment desk`
    );

    setActivePage("orders");
  }, [cart, requiresWaiter, setActivePage, showNotification, subtotal, tableNumber, tax, total, user]);


  // ==========================================================
  // UPDATE ORDER
  // ==========================================================

  const updateOrder = useCallback(async (orderId, updates) => {
    try {
      const firestoreUpdates = {
        ...updates,
        updatedAt: serverTimestamp(),
      };
      if (user?.role === "Waiter" && updates.status === "WAITING_FOR_RECEPTIONIST") {
        firestoreUpdates.waiter = user.name;
      }
      if (user?.role === "Receptionist" && updates.paymentMethod) {
        firestoreUpdates.status = "PAID_WAITING_FOR_COOK";
      }
      await updateDoc(doc(db, "orders", orderId), firestoreUpdates);
      return true;
    } catch (error) {
      console.error("Update order failed:", error);
      showNotification("Could not update this order. It may have changed or your role may not allow this action.");
      return null;
    }
  }, [showNotification, user]);


  // ==========================================================
  // MANAGER
  // ==========================================================

  const managerStats = useMemo(() => {
    let waiting = 0;
    let kitchen = 0;
    let sales = 0;

    for (const order of orders) {
      if (order.status === "WAITING_FOR_WAITER" || order.status === "WAITING_FOR_RECEPTIONIST") waiting += 1;

      if (
        order.status === "PAID_WAITING_FOR_COOK" ||
        order.status === "PREPARING" ||
        order.status === "READY"
      ) {
        kitchen += 1;
      }

      if (order.status !== "CANCELLED") {
        sales += order.total;
      }
    }

    return {
      totalOrders: orders.length,
      waiting,
      kitchen,
      sales,
    };
  }, [orders]);


  // ==========================================================
  // NAVIGATION
  // This hook is intentionally above the login conditional so
  // React executes hooks in the same order on every render.
  // ==========================================================

  const navigation = useMemo(
    () => [
      {
        id: "dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
      },
      ...(ROLE_NAVIGATION[user?.role] || []),
    ],
    [user?.role]
  );


  // ==========================================================
  // LOGIN SCREEN
  // ==========================================================

  if (!user) {

    return (
      <div className="login-page">

        <div className="login-glow glow-one"></div>
        <div className="login-glow glow-two"></div>

        <div className="login-card">

          <div className="brand-large">

            <div className="brand-logo">
              JZ
            </div>

            <div>
              <h1>JAFFA'Z</h1>
              <span>FOOD LOUNGE</span>
            </div>

          </div>


          <div className="login-heading">

            <span className="eyebrow">
              RESTAURANT POS
            </span>

            <h2>
              Welcome back
            </h2>

            <p>
              Sign in to your restaurant workspace.
            </p>

          </div>


          <form onSubmit={login}>

            <label htmlFor="login-email">Email</label>

            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              autoComplete="username"
              aria-label="Email"
              required
            />


            <label>
              Password
            </label>

            <input
              type="password"
              required
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="Enter password"
              autoComplete="current-password"
              aria-label="Password"
            />


            {loginError && (
              <div className="login-error">
                <XCircle size={18} />
                {loginError}
              </div>
            )}


            <button
              type="submit"
              className="primary-button login-button"
              disabled={!apiReady}
            >
              {apiReady ? "Sign In" : "Connecting…"}
              <ArrowRight size={19} />
            </button>

          </form>


          <div className="demo-login">
            <div className="demo-title">
              <Sparkles size={15} />
              Staff sign-in
            </div>
            <p>Use the email and password provided by your manager.</p>
          </div>

        </div>

      </div>
    );
  }


  // ==========================================================
  // SIDEBAR
  // ==========================================================


  // ==========================================================
  // MAIN LAYOUT
  // ==========================================================

  return (

    <div className="app-shell">

      {/* SIDEBAR */}

      <aside className="sidebar">

        <div className="sidebar-brand">

          <div className="mini-logo">
            JZ
          </div>

          <div>
            <strong>JAFFA'Z</strong>
            <small>FOOD LOUNGE</small>
          </div>

        </div>


        <div className="restaurant-status">

          <span className="online-dot"></span>

          POS ONLINE

        </div>


        <nav className="sidebar-nav">

          <div className="nav-label">
            WORKSPACE
          </div>

          {navigation.map((item) => {

            const Icon = item.icon;

            return (

              <button
                key={item.id}
                className={`nav-button ${
                  activePage === item.id
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setActivePage(item.id)
                }
              >

                <Icon size={19} />

                <span>
                  {item.label}
                </span>

                {item.id === "orders" &&
                  managerAttentionOrders.length > 0 && (
                    <b className="nav-count">
                      {managerAttentionOrders.length}
                    </b>
                  )}

              </button>

            );

          })}

        </nav>


        <div className="sidebar-bottom">

          <div className="logged-user">

            <div className="user-avatar">
              {user.name.charAt(0)}
            </div>

            <div>
              <strong>
                {user.name}
              </strong>

              <span>
                {user.role}
              </span>
            </div>

          </div>


          <button
            className="logout-button"
            onClick={logout}
          >
            <LogOut size={18} />
            Logout
          </button>

        </div>

      </aside>


      {/* MAIN */}

      <main className="main-content">

        <header className="topbar">

          <div>

            <span className="topbar-kicker">
              JAFFA'Z FOOD LOUNGE
            </span>

            <h1>
              {activePage === "create-order"
                ? "Create New Order"
                : activePage === "orders"
                ? "Order Management"
                : activePage === "payments"
                ? "Payment Desk"
                : activePage === "kitchen"
                ? "Kitchen Display"
                : activePage === "menu"
                ? "Restaurant Menu"
                : "Dashboard"}
            </h1>

          </div>


          <div className="topbar-actions">

            <button
              type="button"
              className="icon-button"
              title="Refresh"
              onClick={async () => {
                try { await refreshOrders(); showNotification("Orders refreshed"); }
                catch (error) { showNotification(error.message); }
              }}
            >
              <RefreshCw size={19} />
            </button>

            <button
              type="button"
              className="icon-button notification-button"
              title="Notifications"
            >
              <Bell size={19} />

              {waiterQueueOrders.length > 0 && (
                <span></span>
              )}

            </button>

            <button
              type="button"
              className="signout-button"
              onClick={logout}
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut size={17} />
              <span>Sign out</span>
            </button>


            <div className="topbar-user">

              <div className="user-avatar small">
                {user.name.charAt(0)}
              </div>

              <div>
                <strong>
                  {user.name}
                </strong>

                <small>
                  {user.role}
                </small>
              </div>

            </div>

          </div>

        </header>


        {/* TOAST */}

        {notification && (

          <div className="toast">

            <CheckCircle2 size={19} />

            {notification}

          </div>

        )}


        {/* ====================================================
            DASHBOARD
        ==================================================== */}

        {activePage === "dashboard" && (

          <div className="page-content">

            <section className="welcome-card">

              <div>

                <span className="eyebrow">
                  {user.role.toUpperCase()} PORTAL
                </span>

                <h2>
                  Good to see you 👋
                </h2>

                <p>
                  Manage today's restaurant
                  operations from one place.
                </p>

              </div>

              <div className="welcome-icon">
                <Utensils size={38} />
              </div>

            </section>


            {/* MANAGER DASHBOARD */}

            {user.role === "Manager" && (

              <>

                <div className="stats-grid">

                  <StatCard
                    icon={ClipboardList}
                    title="Total Orders"
                    value={managerStats.totalOrders}
                    description="Today's orders"
                  />

                  <StatCard
                    icon={Clock3}
                    title="Waiting"
                    value={managerStats.waiting}
                    description="Awaiting the next handoff"
                  />

                  <StatCard
                    icon={CookingPot}
                    title="Kitchen"
                    value={managerStats.kitchen}
                    description="Active kitchen orders"
                  />

                  <StatCard
                    icon={CircleDollarSign}
                    title="Sales"
                    value={formatPrice(managerStats.sales)}
                    description="Current total"
                  />

                </div>


                <div className="quick-actions">

                  <button
                    onClick={() =>
                      setActivePage("create-order")
                    }
                    className="quick-action primary"
                  >

                    <div className="quick-icon">
                      <Plus size={23} />
                    </div>

                    <div>
                      <strong>
                        Create New Order
                      </strong>

                      <span>
                        Start a customer order
                      </span>
                    </div>

                    <ArrowRight size={20} />

                  </button>


                  <button
                    onClick={() =>
                      setActivePage("orders")
                    }
                    className="quick-action"
                  >

                    <div className="quick-icon">
                      <ClipboardList size={23} />
                    </div>

                    <div>
                      <strong>
                        View Orders
                      </strong>

                      <span>
                        Monitor all restaurant orders
                      </span>
                    </div>

                    <ArrowRight size={20} />

                  </button>

                </div>

              </>
            )}


            {/* WAITER DASHBOARD */}

            {user.role === "Waiter" && (

              <div className="role-dashboard">

                <RoleCard
                  icon={ClipboardList}
                  title="Orders Waiting"
                  value={waiterQueueOrders.length}
                  description="Orders need your confirmation"
                  button="Open Orders"
                  onClick={() =>
                    setActivePage("orders")
                  }
                />

              </div>

            )}


            {/* RECEPTIONIST DASHBOARD */}

            {user.role === "Receptionist" && (

              <div className="role-dashboard">

                <RoleCard
                  icon={CreditCard}
                  title="Pending Payments"
                  value={pendingPaymentOrders.length}
                  description="Orders waiting for payment"
                  button="Open Payment Desk"
                  onClick={() =>
                    setActivePage("payments")
                  }
                />

              </div>

            )}


            {/* COOK DASHBOARD */}

            {user.role === "Cook" && (

              <div className="role-dashboard">

                <RoleCard
                  icon={ChefHat}
                  title="Kitchen Queue"
                  value={kitchenQueueOrders.length}
                  description="Orders waiting in kitchen"
                  button="Open Kitchen"
                  onClick={() =>
                    setActivePage("kitchen")
                  }
                />

              </div>

            )}

          </div>

        )}


        {/* ====================================================
            CREATE ORDER
        ==================================================== */}

        {activePage === "create-order" &&
          user.role === "Manager" && (

            <div className="page-content order-page">

              <div className="order-builder">

                <section className="menu-section">

                  <div className="section-heading">

                    <div>
                      <span className="eyebrow">
                        MENU
                      </span>

                      <h2>
                        Choose Items
                      </h2>
                    </div>

                    <div className="search-box">

                      <Search size={18} />

                      <input
                        value={search}
                        onChange={(e) =>
                          setSearch(e.target.value)
                        }
                        placeholder="Search menu..."
                      />

                    </div>

                  </div>


                  <div className="category-bar">

                    {CATEGORIES.map(
                      (category) => (

                        <button
                          key={category}
                          className={
                            selectedCategory ===
                            category
                              ? "category-button active"
                              : "category-button"
                          }
                          onClick={() =>
                            setSelectedCategory(
                              category
                            )
                          }
                        >

                          {category === "Pizza" && (
                            <Pizza size={16} />
                          )}

                          {category ===
                            "Burgers" && (
                            <Sandwich size={16} />
                          )}

                          {category ===
                            "Drinks" && (
                            <CupSoda size={16} />
                          )}

                          {category ===
                            "Desserts" && (
                            <IceCreamBowl
                              size={16}
                            />
                          )}

                          {category === "All" && (
                            <MenuIcon size={16} />
                          )}

                          {category}

                        </button>

                      )
                    )}

                  </div>


                  <div className="products-grid">

                    {filteredMenu.map(
                      (item) => (

                        <div
                          key={item.id}
                          className="product-card"
                        >

                          <div className="product-top">

                            <div className="food-icon">
                              {item.icon}
                            </div>

                            <span className="product-category">
                              {item.category}
                            </span>

                          </div>


                          <h3>
                            {item.name}
                          </h3>


                          {item.description && (
                            <p>
                              {item.description}
                            </p>
                          )}


                          {item.variants ? (

                            <div className="variant-buttons">

                              {Object.entries(
                                item.variants
                              ).map(
                                ([variant, price]) => (

                                  <button
                                    key={variant}
                                    onClick={() =>
                                      addToCart(
                                        item,
                                        variant
                                      )
                                    }
                                  >

                                    <span>
                                      {variant}
                                    </span>

                                    <strong>
                                      {formatPrice(
                                        price
                                      )}
                                    </strong>

                                  </button>

                                )
                              )}

                            </div>

                          ) : (

                            <div className="product-footer">

                              <strong>
                                {formatPrice(
                                  item.price
                                )}
                              </strong>

                              <button
                                className="add-button"
                                onClick={() =>
                                  addToCart(item)
                                }
                              >
                                <Plus size={18} />
                              </button>

                            </div>

                          )}

                        </div>

                      )
                    )}

                  </div>

                </section>


                {/* CART */}

                <aside className="cart-panel">

                  <div className="cart-header">

                    <div>

                      <span className="eyebrow">
                        CURRENT ORDER
                      </span>

                      <h2>
                        Order Cart
                      </h2>

                    </div>

                    <div className="cart-count">
                      {cart.reduce(
                        (sum, item) =>
                          sum + item.quantity,
                        0
                      )}
                    </div>

                  </div>


                  <div className="table-input">

                    <label>
                      Table / Order Type
                    </label>

                    <input
                      value={tableNumber}
                      onChange={(e) =>
                        setTableNumber(
                          e.target.value
                        )
                      }
                      placeholder="e.g. Table 5 / Takeaway"
                    />

                  </div>

                  <label className="handoff-option">
                    <input
                      type="checkbox"
                      checked={requiresWaiter}
                      onChange={(event) => setRequiresWaiter(event.target.checked)}
                    />
                    <span>
                      <strong>Waiter confirmation required</strong>
                      <small>Leave off to send this order straight to the payment desk.</small>
                    </span>
                  </label>


                  <div className="cart-items">

                    {cart.length === 0 ? (

                      <div className="empty-cart">

                        <ShoppingCart
                          size={40}
                        />

                        <strong>
                          Your cart is empty
                        </strong>

                        <span>
                          Add items from the menu
                        </span>

                      </div>

                    ) : (

                      cart.map((item) => (

                        <div
                          className="cart-item"
                          key={item.cartId}
                        >

                          <div className="cart-food-icon">
                            {item.icon}
                          </div>

                          <div className="cart-item-info">

                            <strong>
                              {item.name}
                            </strong>

                            {item.variant && (
                              <small>
                                {item.variant}
                              </small>
                            )}

                            <span>
                              {formatPrice(
                                item.price
                              )}
                            </span>

                          </div>


                          <div className="quantity-control">

                            <button
                              onClick={() =>
                                decreaseQuantity(
                                  item.cartId
                                )
                              }
                            >
                              <Minus size={14} />
                            </button>

                            <b>
                              {item.quantity}
                            </b>

                            <button
                              onClick={() =>
                                increaseQuantity(
                                  item.cartId
                                )
                              }
                            >
                              <Plus size={14} />
                            </button>

                          </div>


                          <button
                            className="remove-item"
                            onClick={() =>
                              removeFromCart(
                                item.cartId
                              )
                            }
                          >
                            <Trash2 size={16} />
                          </button>

                        </div>

                      ))

                    )}

                  </div>


                  <div className="cart-summary">

                    <div>
                      <span>
                        Subtotal
                      </span>

                      <strong>
                        {formatPrice(subtotal)}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Tax 5%
                      </span>

                      <strong>
                        {formatPrice(tax)}
                      </strong>
                    </div>

                    <div className="grand-total">

                      <span>
                        Total
                      </span>

                      <strong>
                        {formatPrice(total)}
                      </strong>

                    </div>

                  </div>


                  <button
                    className="primary-button full-button"
                    onClick={createOrder}
                    disabled={cart.length === 0}
                  >

                    <Receipt size={19} />

                    Create Order

                    <ArrowRight size={18} />

                  </button>

                </aside>

              </div>

            </div>

          )}


        {/* ====================================================
            ORDERS
        ==================================================== */}

        {activePage === "orders" && (

          <div className="page-content">

            <div className="section-heading">

              <div>

                <span className="eyebrow">
                  ORDER CENTER
                </span>

                <h2>
                  Restaurant Orders
                </h2>

              </div>

            </div>


            {orders.length === 0 ? (

              <EmptyState
                icon={ClipboardList}
                title="No orders yet"
                description="Orders created by the manager will appear here."
              />

            ) : (

              <div className="orders-grid">

                {orders.map((order) => (

                  <OrderCard
                    key={order.id}
                    order={order}
                    role={user.role}
                    updateOrder={updateOrder}
                    showNotification={
                      showNotification
                    }
                  />

                ))}

              </div>

            )}

          </div>

        )}


        {/* ====================================================
            PAYMENT DESK
        ==================================================== */}

        {activePage === "payments" &&
          user.role === "Receptionist" && (

            <div className="page-content">

              <div className="section-heading">

                <div>

                  <span className="eyebrow">
                    RECEPTION
                  </span>

                  <h2>
                    Payment Desk
                  </h2>

                </div>

              </div>


              <div className="orders-grid">

                {pendingPaymentOrders.map((order) => (

                    <PaymentCard
                      key={order.id}
                      order={order}
                      updateOrder={updateOrder}
                      showNotification={
                        showNotification
                      }
                    />

                  ))}

              </div>


              {pendingPaymentOrders.length === 0 && (

                <EmptyState
                  icon={CreditCard}
                  title="No pending payments"
                  description="Confirmed orders will appear here."
                />

              )}

            </div>

          )}


        {/* ====================================================
            KITCHEN
        ==================================================== */}

        {activePage === "kitchen" &&
          user.role === "Cook" && (

            <div className="page-content">

              <div className="section-heading">

                <div>

                  <span className="eyebrow">
                    KITCHEN DISPLAY
                  </span>

                  <h2>
                    Kitchen Queue
                  </h2>

                </div>

              </div>


              <div className="orders-grid">

                {kitchenQueueOrders.map((order) => (

                    <KitchenCard
                      key={order.id}
                      order={order}
                      updateOrder={updateOrder}
                      showNotification={
                        showNotification
                      }
                    />

                  ))}

              </div>


              {kitchenQueueOrders.length === 0 && (

                <EmptyState
                  icon={ChefHat}
                  title="Kitchen is clear"
                  description="Paid orders will appear here."
                />

              )}

            </div>

          )}


        {/* ====================================================
            MENU
        ==================================================== */}

        {activePage === "menu" &&
          user.role === "Manager" && (

            <div className="page-content">

              <div className="section-heading">

                <div>

                  <span className="eyebrow">
                    RESTAURANT MENU
                  </span>

                  <h2>
                    Jaffa'z Menu
                  </h2>

                </div>

                <div className="menu-total">
                  {menuItems.length} Items
                </div>

              </div>


              <div className="menu-admin-grid">

                {menuItems.map((item) => (

                  <div
                    className="menu-admin-card"
                    key={item.id}
                  >

                    <div className="food-icon large">
                      {item.icon}
                    </div>

                    <div>

                      <span>
                        {item.category}
                      </span>

                      <h3>
                        {item.name}
                      </h3>

                      {item.price ? (

                        <strong>
                          {formatPrice(item.price)}
                        </strong>

                      ) : (

                        <strong>
                          Multiple Sizes
                        </strong>

                      )}

                    </div>

                  </div>

                ))}

              </div>

            </div>

          )}

        {selectedProduct && (
          <div className="modal-backdrop" role="presentation" onClick={(event) => {
            if (event.target === event.currentTarget) setSelectedProduct(null);
          }}>
            <form className="special-price-dialog" onSubmit={addSpecialItem}>
              <span className="eyebrow">CUSTOM MENU PRICE</span>
              <h2>{selectedProduct.name}</h2>
              <p>Enter the agreed price for this made to order item.</p>
              <label htmlFor="special-price">Price in rupees</label>
              <input id="special-price" type="number" min="1" step="1" autoFocus required value={customPrice} onChange={(event) => setCustomPrice(event.target.value)} placeholder="Enter amount" />
              <div className="dialog-actions">
                <button type="button" className="secondary-button" onClick={() => setSelectedProduct(null)}>Cancel</button>
                <button type="submit" className="primary-button">Add to order</button>
              </div>
            </form>
          </div>
        )}

      </main>

    </div>
  );
}


// ============================================================
// STAT CARD
// ============================================================

const StatCard = memo(function StatCard({
  icon: Icon,
  title,
  value,
  description,
}) {

  return (

    <div className="stat-card">

      <div className="stat-icon">
        <Icon size={21} />
      </div>

      <div>

        <span>
          {title}
        </span>

        <strong>
          {value}
        </strong>

        <small>
          {description}
        </small>

      </div>

    </div>

  );
});


// ============================================================
// ROLE CARD
// ============================================================

const RoleCard = memo(function RoleCard({
  icon: Icon,
  title,
  value,
  description,
  button,
  onClick,
}) {

  return (

    <div className="role-card">

      <div className="role-card-icon">
        <Icon size={30} />
      </div>

      <div>

        <span>
          {title}
        </span>

        <strong>
          {value}
        </strong>

        <p>
          {description}
        </p>

      </div>

      <button
        className="primary-button"
        onClick={onClick}
      >
        {button}
        <ArrowRight size={18} />
      </button>

    </div>

  );
});


// ============================================================
// ORDER CARD
// ============================================================

const OrderCard = memo(function OrderCard({
  order,
  role,
  updateOrder,
  showNotification,
}) {

  const status =
    statusInfo[order.status] ||
    statusInfo.WAITING_FOR_WAITER;

  const canWaiterConfirm =
    role === "Waiter" &&
    order.status === "WAITING_FOR_WAITER";

  const canManagerCancel =
    role === "Manager" &&
    order.status !== "COMPLETED" &&
    order.status !== "CANCELLED";


  const confirmOrder = async () => {
    const updated = await updateOrder(order.id, {
      status: "WAITING_FOR_RECEPTIONIST",
    });
    if (!updated) return;
    showNotification(
      `Order #${order.displayId || order.id} confirmed`
    );
  };


  const cancelOrder = async () => {
    const updated = await updateOrder(order.id, {
      status: "CANCELLED",
    });
    if (!updated) return;
    showNotification(
      `Order #${order.displayId || order.id} cancelled`
    );
  };


  return (

    <div className="order-card">

      <div className="order-card-header">

        <div>

          <span className="order-number">
            ORDER #{order.displayId || order.id}
          </span>

          <h3>
            {order.table}
          </h3>

        </div>

        <span
          className={`status-badge ${status.className}`}
        >
          <Clock3 size={14} />
          {status.label}
        </span>

      </div>


      <div className="order-time">
        <Clock3 size={14} />
        Created {new Date(order.createdAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
      </div>


      <div className="order-items">

        {order.items.map((item) => (

          <div
            className="order-item"
            key={item.cartId}
          >

            <div>

              <strong>
                {item.quantity} ×{" "}
                {item.name}
              </strong>

              {item.variant && (
                <small>
                  {item.variant}
                </small>
              )}

            </div>

            <span>
              {formatPrice(
                item.price * item.quantity
              )}
            </span>

          </div>

        ))}

      </div>


      <div className="order-total">

        <span>
          Total
        </span>

        <strong>
          {formatPrice(order.total)}
        </strong>

      </div>


      <div className="order-actions">

        {canWaiterConfirm && (

          <button
            className="success-button"
            onClick={confirmOrder}
          >
            <CheckCircle2 size={18} />
            Confirm Order
          </button>

        )}

        {canManagerCancel && (

          <button
            className="danger-button"
            onClick={cancelOrder}
          >
            <XCircle size={18} />
            Cancel
          </button>

        )}

      </div>

    </div>

  );

});


// ============================================================
// PAYMENT CARD
// ============================================================

const PaymentCard = memo(function PaymentCard({
  order,
  updateOrder,
  showNotification,
}) {

  const [selectedPayment, setSelectedPayment] =
    useState("Cash");


  const payOrder = async () => {
    const updated = await updateOrder(order.id, {
      paymentMethod: selectedPayment,
    });
    if (!updated) return;
    showNotification(
      `Order #${order.displayId || order.id} paid by ${selectedPayment}`
    );

  };


  return (

    <div className="order-card payment-card">

      <div className="order-card-header">

        <div>

          <span className="order-number">
            ORDER #{order.displayId || order.id}
          </span>

          <h3>
            {order.table}
          </h3>

        </div>

        <span className="status-badge status-payment">
          <CreditCard size={14} />
          Payment Due
        </span>

      </div>


      <div className="payment-total">

        <span>
          Amount Due
        </span>

        <strong>
          {formatPrice(order.total)}
        </strong>

      </div>


      <div className="payment-methods">

        <button
          className={
            selectedPayment === "Cash"
              ? "payment-method active"
              : "payment-method"
          }
          onClick={() =>
            setSelectedPayment("Cash")
          }
        >

          <Banknote size={20} />

          Cash

        </button>


        <button
          className={
            selectedPayment === "Card"
              ? "payment-method active"
              : "payment-method"
          }
          onClick={() =>
            setSelectedPayment("Card")
          }
        >

          <CreditCard size={20} />

          Card

        </button>


        <button
          className={
            selectedPayment === "Digital Wallet"
              ? "payment-method active"
              : "payment-method"
          }
          onClick={() =>
            setSelectedPayment(
              "Digital Wallet"
            )
          }
        >

          <Smartphone size={20} />

          Wallet

        </button>

      </div>


      <button
        className="primary-button full-button"
        onClick={payOrder}
      >

        <CheckCircle2 size={19} />

        Complete Payment

      </button>

    </div>

  );

});


// ============================================================
// KITCHEN CARD
// ============================================================

const KitchenCard = memo(function KitchenCard({
  order,
  updateOrder,
  showNotification,
}) {

  const startCooking = async () => {
    const updated = await updateOrder(order.id, {
      status: "PREPARING",
    });
    if (!updated) return;
    showNotification(
      `Order #${order.displayId || order.id} is now preparing`
    );

  };


  const markReady = async () => {
    const updated = await updateOrder(order.id, {
      status: "READY",
    });
    if (!updated) return;
    showNotification(
      `Order #${order.displayId || order.id} is ready`
    );

  };


  const completeOrder = async () => {
    const updated = await updateOrder(order.id, {
      status: "COMPLETED",
    });
    if (!updated) return;
    showNotification(
      `Order #${order.displayId || order.id} completed`
    );

  };


  return (

    <div className="order-card kitchen-card">

      <div className="order-card-header">

        <div>

          <span className="order-number">
            KITCHEN #{order.displayId || order.id}
          </span>

          <h3>
            {order.table}
          </h3>

        </div>

        <span
          className={`status-badge ${
            order.status === "PREPARING"
              ? "status-preparing"
              : "status-kitchen"
          }`}
        >
          <Flame size={14} />

          {order.status === "PREPARING" ? "Preparing" : order.status === "READY" ? "Ready to serve" : "New Kitchen Order"}

        </span>

      </div>


      <div className="order-items">

        <div className="order-time">
          <CreditCard size={14} />
          {order.paymentMethod ? `Paid by ${order.paymentMethod}` : "Payment pending at reception"}
        </div>

        {order.items.map((item) => (

          <div
            className="kitchen-item"
            key={item.cartId}
          >

            <div className="kitchen-quantity">
              {item.quantity}
            </div>

            <div>

              <strong>
                {item.name}
              </strong>

              {item.variant && (
                <small>
                  {item.variant}
                </small>
              )}

            </div>

          </div>

        ))}

      </div>


      <div className="order-actions">

        {order.status === "PAID_WAITING_FOR_COOK" && (

          <button
            className="primary-button"
            onClick={startCooking}
          >

            <CookingPot size={18} />

            Start Preparing

          </button>

        )}


        {order.status === "PREPARING" && (

          <button
            className="success-button"
            onClick={markReady}
          >

            <PackageCheck size={18} />

            Mark Ready

          </button>

        )}

        {order.status === "READY" && (
          <button className="success-button" onClick={completeOrder}>
            <CheckCircle2 size={18} />
            Complete Order
          </button>
        )}

      </div>

    </div>

  );

});


// ============================================================
// EMPTY STATE
// ============================================================

const EmptyState = memo(function EmptyState({
  icon: Icon,
  title,
  description,
}) {

  return (

    <div className="empty-state">

      <div className="empty-icon">
        <Icon size={32} />
      </div>

      <h3>
        {title}
      </h3>

      <p>
        {description}
      </p>

    </div>

    );
});
