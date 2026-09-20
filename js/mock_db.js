// Mock Database for GreenLoop AI Prototype

export const COMPOST_UNITS = [
    {
        id: "c1",
        name: "Kalighat Temple Incense Collective",
        type: "temple",
        location: { lat: 22.5196, lng: 88.3442 },
        capacityKg: 200,
        currentLoadKg: 45,
        acceptedMaterials: ["flower", "marigold", "rose", "jasmine"],
        contact: "kalighat.trust@greenloop.local",
        rating: 4.7,
        pickupsCompleted: 68,
        operatingHours: "5:00 AM - 1:00 PM (Daily)"
    },
    {
        id: "c2",
        name: "Salt Lake Community Compost Pit",
        type: "community_pit",
        location: { lat: 22.5760, lng: 88.4112 },
        capacityKg: 80,
        currentLoadKg: 20,
        acceptedMaterials: ["flower", "leaves", "vegetable"],
        contact: "saltlake.compost@greenloop.local",
        rating: 4.4,
        pickupsCompleted: 35,
        operatingHours: "7:00 AM - 7:00 PM (Mon-Sat)"
    },
    {
        id: "c3",
        name: "Jadavpur Urban Farm",
        type: "urban_farm",
        location: { lat: 22.4991, lng: 88.3694 },
        capacityKg: 25,
        currentLoadKg: 5,
        acceptedMaterials: ["vegetable", "fruit_waste", "leaves", "garden_trimmings"],
        contact: "jadavpur.farm@greenloop.local",
        rating: 4.2,
        pickupsCompleted: 14,
        operatingHours: "9:00 AM - 5:00 PM (Weekends only)"
    },
    {
        id: "c4",
        name: "KMC Green Waste Processing Center",
        type: "municipal",
        location: { lat: 22.6320, lng: 88.3980 },
        capacityKg: 2000,
        currentLoadKg: 1850,
        acceptedMaterials: ["flower", "leaves", "vegetable", "fruit_waste", "garden_trimmings", "food_waste"],
        contact: "kmc.greenwaste@greenloop.local",
        rating: 3.8,
        pickupsCompleted: 80,
        operatingHours: "24/7 Drop-off"
    },
    {
        id: "c5",
        name: "Eco Warriors NGO Collective",
        type: "ngo",
        location: { lat: 22.5321, lng: 88.3155 },
        capacityKg: 120,
        currentLoadKg: 110,
        acceptedMaterials: ["flower", "leaves", "vegetable"],
        contact: "ecowarriors@greenloop.local",
        rating: 4.9,
        pickupsCompleted: 72,
        operatingHours: "8:00 AM - 8:00 PM (Mon-Fri)"
    },
    {
        id: "c6",
        name: "Howrah Bridge Flower Market Recycler",
        type: "temple",
        location: { lat: 22.5858, lng: 88.3464 },
        capacityKg: 500,
        currentLoadKg: 180,
        acceptedMaterials: ["flower", "marigold", "rose", "jasmine", "chrysanthemum", "lily"],
        contact: "howrah.flower@greenloop.local",
        rating: 4.6,
        pickupsCompleted: 55,
        operatingHours: "6:00 AM - 9:00 AM (Daily)"
    },
    {
        id: "c7",
        name: "New Town School Garden Program",
        type: "school",
        location: { lat: 22.5920, lng: 88.4648 },
        capacityKg: 15,
        currentLoadKg: 3,
        acceptedMaterials: ["leaves", "vegetable", "garden_trimmings"],
        contact: "newtown.school@greenloop.local",
        rating: 4.5,
        pickupsCompleted: 8,
        operatingHours: "10:00 AM - 3:00 PM (Mon-Fri, Term time)"
    },
    {
        id: "c8",
        name: "Dakshineswar Puja Waste Hub",
        type: "temple",
        location: { lat: 22.6554, lng: 88.3574 },
        capacityKg: 300,
        currentLoadKg: 75,
        acceptedMaterials: ["flower", "marigold", "rose", "leaves"],
        contact: "dakshineswar.hub@greenloop.local",
        rating: 4.3,
        pickupsCompleted: 42,
        operatingHours: "5:30 AM - 12:00 PM (Daily)"
    },
    {
        id: "c9",
        name: "Behala Private Vermicompost Farm",
        type: "urban_farm",
        location: { lat: 22.4583, lng: 88.3170 },
        capacityKg: 40,
        currentLoadKg: 12,
        acceptedMaterials: ["vegetable", "fruit_waste", "food_waste"],
        contact: "behala.vermi@greenloop.local",
        rating: 4.8,
        pickupsCompleted: 51,
        operatingHours: "7:00 AM - 6:00 PM (Daily)"
    },
    {
        id: "c10",
        name: "Ballygunge Terrace Composters",
        type: "community_pit",
        location: { lat: 22.5275, lng: 88.3638 },
        capacityKg: 30,
        currentLoadKg: 28,
        acceptedMaterials: ["flower", "leaves"],
        contact: "ballygunge.terrace@greenloop.local",
        rating: 4.1,
        pickupsCompleted: 19,
        operatingHours: "8:00 AM - 12:00 PM (Sat-Sun)"
    },
    {
        id: "c11",
        name: "Rajarhat Green Corridor Project",
        type: "ngo",
        location: { lat: 22.6100, lng: 88.4500 },
        capacityKg: 150,
        currentLoadKg: 30,
        acceptedMaterials: ["leaves", "garden_trimmings", "flower", "vegetable"],
        contact: "rajarhat.green@greenloop.local",
        rating: 4.0,
        pickupsCompleted: 5,
        operatingHours: "9:00 AM - 4:00 PM (Tue, Thu, Sat)"
    },
    {
        id: "c12",
        name: "Gariahat Market Organic Collective",
        type: "community_pit",
        location: { lat: 22.5143, lng: 88.3657 },
        capacityKg: 60,
        currentLoadKg: 15,
        acceptedMaterials: ["vegetable", "fruit_waste", "flower", "food_waste"],
        contact: "gariahat.organic@greenloop.local",
        rating: 4.6,
        pickupsCompleted: 38,
        operatingHours: "6:00 AM - 10:00 AM (Daily)"
    }
];

export const PLANT_KNOWLEDGE_BASE = [
    {
        id: "p1",
        species: "Marigold (Genda)",
        watering: "Every 2-3 days",
        sunlight: "Full Sun",
        difficulty: "Easy",
        suitableSpaces: ["Balcony (Pots/Containers)", "Rooftop Garden", "Community Plot", "Backyard/Ground Bed"]
    },
    {
        id: "p2",
        species: "Hibiscus (Gudhal)",
        watering: "Daily",
        sunlight: "Full Sun",
        difficulty: "Medium",
        suitableSpaces: ["Balcony (Pots/Containers)", "Rooftop Garden", "Community Plot", "Backyard/Ground Bed"]
    },
    {
        id: "p3",
        species: "Tulsi (Holy Basil)",
        watering: "When top inch dry",
        sunlight: "Partial Sun",
        difficulty: "Easy",
        suitableSpaces: ["Balcony (Pots/Containers)", "Windowsill", "Rooftop Garden", "Community Plot", "Backyard/Ground Bed"]
    },
    {
        id: "p4",
        species: "Jasmine (Mogra)",
        watering: "Keep moist",
        sunlight: "Full Sun",
        difficulty: "Medium",
        suitableSpaces: ["Balcony (Pots/Containers)", "Rooftop Garden", "Community Plot", "Backyard/Ground Bed"]
    },
    {
        id: "p5",
        species: "Rose (Gulab)",
        watering: "Twice a week",
        sunlight: "Full Sun",
        difficulty: "Medium",
        suitableSpaces: ["Balcony (Pots/Containers)", "Rooftop Garden", "Community Plot", "Backyard/Ground Bed"]
    },
    {
        id: "p6",
        species: "Neem Tree",
        watering: "Low",
        sunlight: "Full Sun",
        difficulty: "Easy",
        suitableSpaces: ["Community Plot", "Backyard/Ground Bed"]
    },
    {
        id: "p7",
        species: "Lotus (Kamal)",
        watering: "Aquatic",
        sunlight: "Full Sun",
        difficulty: "Hard",
        suitableSpaces: ["Backyard/Ground Bed"]
    },
    {
        id: "p8",
        species: "Money Plant (Pothos)",
        watering: "Every 1-2 weeks",
        sunlight: "Indirect",
        difficulty: "Easy",
        suitableSpaces: ["Balcony (Pots/Containers)", "Windowsill", "Vertical Wall Garden", "Indoor Space"]
    },
    {
        id: "p9",
        species: "Aloe Vera",
        watering: "Every 2-3 weeks",
        sunlight: "Indirect/Full Sun",
        difficulty: "Easy",
        suitableSpaces: ["Balcony (Pots/Containers)", "Windowsill", "Rooftop Garden", "Backyard/Ground Bed"]
    },
    {
        id: "p10",
        species: "Curry Leaf (Kadi Patta)",
        watering: "Moderate",
        sunlight: "Full Sun",
        difficulty: "Medium",
        suitableSpaces: ["Balcony (Pots/Containers)", "Rooftop Garden", "Community Plot", "Backyard/Ground Bed"]
    },
    {
        id: "p11",
        species: "Bougainvillea",
        watering: "Low",
        sunlight: "Full Sun",
        difficulty: "Easy",
        suitableSpaces: ["Rooftop Garden", "Community Plot", "Backyard/Ground Bed", "Vertical Wall Garden"]
    },
    {
        id: "p12",
        species: "Areca Palm",
        watering: "Lightly moist",
        sunlight: "Indirect",
        difficulty: "Medium",
        suitableSpaces: ["Balcony (Pots/Containers)", "Backyard/Ground Bed", "Indoor Space"]
    },
    {
        id: "f1",
        species: "Sunflower (Surajmukhi)",
        watering: "Every 2-3 days",
        sunlight: "Full Sun",
        difficulty: "Easy",
        suitableSpaces: ["Rooftop Garden", "Community Plot", "Backyard/Ground Bed"]
    },
    {
        id: "f2",
        species: "Zinnia",
        watering: "Consistently moist",
        sunlight: "Full Sun",
        difficulty: "Easy",
        suitableSpaces: ["Balcony (Pots/Containers)", "Rooftop Garden", "Community Plot", "Backyard/Ground Bed"]
    },
    {
        id: "f3",
        species: "Petunia",
        watering: "Every 2-5 days",
        sunlight: "Full Sun",
        difficulty: "Medium",
        suitableSpaces: ["Balcony (Pots/Containers)", "Vertical Wall Garden", "Rooftop Garden"]
    },
    {
        id: "f4",
        species: "Chrysanthemum",
        watering: "1 inch per week",
        sunlight: "Full Sun",
        difficulty: "Medium",
        suitableSpaces: ["Balcony (Pots/Containers)", "Rooftop Garden", "Community Plot", "Backyard/Ground Bed"]
    },
    {
        id: "f5",
        species: "Orchid",
        watering: "Once a week",
        sunlight: "Indirect",
        difficulty: "Hard",
        suitableSpaces: ["Windowsill", "Indoor Space"]
    },
    {
        id: "h1",
        species: "Mint (Pudina)",
        watering: "Consistently moist",
        sunlight: "Partial Sun",
        difficulty: "Easy",
        suitableSpaces: ["Balcony (Pots/Containers)", "Windowsill", "Vertical Wall Garden"]
    },
    {
        id: "h2",
        species: "Coriander (Dhania)",
        watering: "Lightly moist",
        sunlight: "Partial Sun",
        difficulty: "Medium",
        suitableSpaces: ["Balcony (Pots/Containers)", "Windowsill", "Community Plot"]
    },
    {
        id: "v1",
        species: "Tomato",
        watering: "Daily",
        sunlight: "Full Sun",
        difficulty: "Medium",
        suitableSpaces: ["Balcony (Pots/Containers)", "Rooftop Garden", "Community Plot", "Backyard/Ground Bed"]
    },
];


export const STUDENTS = [
    { id: "s1", name: "Aarav K.", location: { lat: 12.97, lng: 77.59 }, distanceKm: 1.5, needScore: 85, needs: ["textbook", "uniform", "grade 8"] },
    { id: "s2", name: "Priya S.", location: { lat: 12.98, lng: 77.58 }, distanceKm: 2.8, needScore: 92, needs: ["uniform", "grade 5", "shoes"] },
    { id: "s3", name: "Rohan M.", location: { lat: 12.96, lng: 77.60 }, distanceKm: 4.1, needScore: 70, needs: ["textbook", "grade 10", "bag"] },
    { id: "s4", name: "Neha J.", location: { lat: 12.95, lng: 77.57 }, distanceKm: 3.2, needScore: 88, needs: ["backpack", "notebooks", "grade 6"] },
    { id: "s5", name: "Vikram R.", location: { lat: 12.99, lng: 77.61 }, distanceKm: 5.0, needScore: 95, needs: ["laptop", "math textbook", "grade 12"] },
    { id: "s6", name: "Anjali T.", location: { lat: 12.94, lng: 77.58 }, distanceKm: 2.2, needScore: 78, needs: ["crayons", "art supplies", "grade 2"] }
];

export const SEED_EXCHANGE = [
    { id: "x1", user: "Sneha G.", plant: "Tulsi Cuttings", distance: "0.8 km", image: "https://images.unsplash.com/photo-1590059955890-8e100e4e5eb3?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80" },
    { id: "x2", user: "Rahul T.", plant: "Marigold Seeds", distance: "1.2 km", image: "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80" },
    { id: "x3", user: "Anita P.", plant: "Aloe Vera Pups", distance: "2.5 km", image: "https://images.unsplash.com/photo-1596547609652-9fc5d8d42850?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80" },
    { id: "x4", user: "Deepak M.", plant: "Tomato Saplings", distance: "3.0 km", image: "https://images.unsplash.com/photo-1592841200221-a6898f307baa?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80" },
    { id: "x5", user: "Kiran L.", plant: "Mint Runners", distance: "1.5 km", image: "https://images.unsplash.com/photo-1621217036662-7f28ed530467?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80" },
    { id: "x6", user: "Pooja V.", plant: "Hibiscus Cuttings", distance: "4.2 km", image: "https://images.unsplash.com/photo-1555541604-037166164d1c?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80" }
];

export const SEASONAL_RULES = {
    currentSeason: "Marigold Season",
    timeLeft: "3 weeks left",
    message: "Perfect time to plant Marigolds for upcoming festivals!"
};

export const CRAFT_KB = {
    "plastic bottle": [
        { title: "Self-Watering Planter", difficulty: "Easy", time: "15 mins", reason: "Uses the bottle's shape to create a water reservoir. Perfect for balcony gardens.", impact: "Diverts ~0.05kg from landfill" },
        { title: "Bird Feeder", difficulty: "Medium", time: "30 mins", reason: "Requires cutting and hanging. Great way to reuse durable plastic outdoors.", impact: "Diverts ~0.1kg from landfill" },
        { title: "Vertical Garden Tower", difficulty: "Hard", time: "2 hours", reason: "Connect multiple bottles to create a space-saving herb tower.", impact: "Diverts ~0.5kg from landfill" }
    ],
    "cardboard": [
        { title: "Drawer Organizers", difficulty: "Easy", time: "20 mins", reason: "Cardboard is easy to cut and fold into rigid compartments.", impact: "Diverts ~0.3kg from landfill" },
        { title: "Cat Scratching Pad", difficulty: "Medium", time: "45 mins", reason: "Corrugated cardboard cut into strips makes a perfect texture for cats.", impact: "Diverts ~0.5kg from landfill" }
    ],
    "glass jar": [
        { title: "Terrarium", difficulty: "Medium", time: "40 mins", reason: "Glass jars create a perfect humid microclimate for small mosses and ferns.", impact: "Diverts ~0.4kg from landfill" },
        { title: "Spice Storage", difficulty: "Easy", time: "10 mins", reason: "Clean and reuse jars for airtight, sustainable kitchen storage.", impact: "Diverts ~0.2kg from landfill" }
    ],
    "tin/metal container": [
        { title: "Pencil Holder", difficulty: "Easy", time: "15 mins", reason: "Wrap in twine or paint for a rustic desk organizer.", impact: "Diverts ~0.1kg from landfill" },
        { title: "Hanging Herb Planters", difficulty: "Medium", time: "35 mins", reason: "Punch holes for drainage and string them up for a vertical garden.", impact: "Diverts ~0.2kg from landfill" }
    ],
    "old clothes": [
        { title: "T-Shirt Tote Bag", difficulty: "Easy", time: "25 mins", reason: "Cut and tie fringes at the bottom to make a no-sew reusable grocery bag.", impact: "Diverts ~0.3kg from landfill" },
        { title: "Cleaning Rags", difficulty: "Easy", time: "5 mins", reason: "Cut into squares to replace single-use paper towels.", impact: "Diverts ~0.1kg from landfill" },
        { title: "Braided Rug", difficulty: "Hard", time: "3 hours", reason: "Braid strips of old fabric into a sturdy, colorful rug.", impact: "Diverts ~2.0kg from landfill" }
    ],
    "aluminum can": [
        { title: "Lanterns", difficulty: "Medium", time: "45 mins", reason: "Punch patterns into the sides for beautiful outdoor tealight holders.", impact: "Diverts ~0.05kg from landfill" },
        { title: "Plant Markers", difficulty: "Easy", time: "15 mins", reason: "Cut into strips and stamp or write names for weatherproof garden labels.", impact: "Diverts ~0.02kg from landfill" }
    ],
    "wine cork": [
        { title: "Cork Board", difficulty: "Medium", time: "1 hour", reason: "Glue them together in a frame for a custom bulletin board.", impact: "Diverts ~0.2kg from landfill" },
        { title: "Mini Planters", difficulty: "Easy", time: "20 mins", reason: "Hollow out the center and add a tiny succulent with a magnet on the back.", impact: "Diverts ~0.05kg from landfill" }
    ],
    "e-waste/old electronics": [
        { title: "Circuit Board Art", difficulty: "Medium", time: "1 hour", reason: "Frame interesting circuit boards or turn them into coasters or jewelry.", impact: "Diverts ~0.3kg from landfill" },
        { title: "Keyboard Key Magnets", difficulty: "Easy", time: "20 mins", reason: "Pop off old keys and glue magnets to the back for geeky fridge magnets.", impact: "Diverts ~0.1kg from landfill" }
    ],
    "broken ceramic": [
        { title: "Mosaic Stepping Stones", difficulty: "Hard", time: "2.5 hours", reason: "Use broken pieces to create beautiful, colorful designs in concrete.", impact: "Diverts ~1.5kg from landfill" },
        { title: "Pot Drainage", difficulty: "Easy", time: "5 mins", reason: "Place curved pieces over drainage holes in plant pots to keep soil in.", impact: "Diverts ~0.5kg from landfill" }
    ],
    "paper waste": [
        { title: "Seed Paper", difficulty: "Medium", time: "1 hour", reason: "Blend with water and seeds, then dry to make plantable greeting cards.", impact: "Diverts ~0.2kg from landfill" },
        { title: "Papier-Mâché Bowls", difficulty: "Medium", time: "2 hours", reason: "Create decorative bowls for keys or dry items.", impact: "Diverts ~0.4kg from landfill" }
    ]
};

export const RECYCLING_FACILITIES = [
    { id: "r1", name: "GreenCity Dry Waste Center", location: { lat: 12.9710, lng: 77.5930 }, accepts: ["Glass", "Metal", "Plastic Type 1-7"], hours: "9:00 AM - 5:00 PM (Mon-Sat)" },
    { id: "r2", name: "EcoSort Facility", location: { lat: 12.9850, lng: 77.5850 }, accepts: ["Paper", "Cardboard", "Plastic Type 1-7"], hours: "8:00 AM - 4:00 PM (Mon-Sat)" },
    { id: "r3", name: "TechScrap E-Waste Recyclers", location: { lat: 12.9550, lng: 77.6050 }, accepts: ["E-waste", "Batteries", "Cables"], hours: "10:00 AM - 6:00 PM (Mon-Fri)" },
    { id: "r4", name: "Fabric Revival Initiative", location: { lat: 12.9900, lng: 77.6100 }, accepts: ["Textiles", "Old Clothes", "Shoes"], hours: "9:00 AM - 2:00 PM (Weekends)" },
    { id: "r5", name: "Metro Glass & Metal Works", location: { lat: 12.9600, lng: 77.5800 }, accepts: ["Glass", "Aluminum", "Tin"], hours: "7:00 AM - 3:00 PM (Daily)" }
];

export const MARKETPLACE_LISTINGS = [
    { id: "m1", maker: "Kavya R.", item: "Hand-painted Bottle Lamp", category: "Upcycled Decor", description: "Made from recycled glass bottles, perfect for bedside lighting.", location: { lat: 12.9730, lng: 77.5950 }, dateAdded: "2026-09-18", image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80" },
    { id: "m2", maker: "Arjun D.", item: "Upcycled Denim Tote", category: "Upcycled Decor", description: "Sturdy tote bag sewn from old jeans. Washable and durable.", location: { lat: 12.9800, lng: 77.6000 }, dateAdded: "2026-09-19", image: "https://images.unsplash.com/photo-1544816155-12df9643f363?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80" },
    { id: "m3", maker: "Zara M.", item: "Coconut Shell Planter", category: "Compost/Planters", description: "Natural hanging planter. Good drainage, completely biodegradable.", location: { lat: 12.9650, lng: 77.5850 }, dateAdded: "2026-09-17", image: "https://images.unsplash.com/photo-1416879598553-337b51bc5730?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80" },
    { id: "m4", maker: "Rohit P.", item: "Neem Oil Spray (Homemade)", category: "Pest Control", description: "Organic pest control mixed with mild soap. Safe for veggies.", location: { lat: 12.9900, lng: 77.5750 }, dateAdded: "2026-09-20", image: "https://images.unsplash.com/photo-1596700813735-5b4cf53569d6?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80" },
    { id: "m5", maker: "Sunita B.", item: "Organic Compost (5kg)", category: "Compost/Planters", description: "Rich, dark compost from kitchen scraps and dry leaves.", location: { lat: 12.9550, lng: 77.6150 }, dateAdded: "2026-09-15", image: "https://images.unsplash.com/photo-1590858163977-7422b93478d1?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80" },
    { id: "m6", maker: "Tanya L.", item: "Macrame Plant Hanger", category: "Upcycled Decor", description: "Hand-knotted from recycled cotton rope. Holds standard pots.", location: { lat: 12.9680, lng: 77.5920 }, dateAdded: "2026-09-16", image: "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80" }
];

export const TREATMENT_KB = {
    "spider mites": {
        treatment: "Neem Oil Spray",
        frequency: "Apply every 3-5 days for 2 weeks",
        instructions: "Mix 1 tbsp neem oil and a few drops of mild soap in 1L of water. Spray on the underside of leaves.",
        suppliesNeeded: ["neem oil", "spray bottle"]
    },
    "root rot": {
        treatment: "Repotting & Pruning",
        frequency: "Immediate, one-time action",
        instructions: "Remove plant from pot, trim away mushy dark roots, repot in fresh well-draining soil. Reduce watering.",
        suppliesNeeded: ["fresh soil", "clean shears"]
    },
    "aphids": {
        treatment: "Soap Water Solution",
        frequency: "Spray every 2-3 days",
        instructions: "Mix mild liquid soap with water and spray directly on aphids to break down their protective coating.",
        suppliesNeeded: ["mild liquid soap", "spray bottle"]
    },
    "powdery mildew": {
        treatment: "Baking Soda Spray",
        frequency: "Spray once a week",
        instructions: "Mix 1 tbsp baking soda, 1/2 tsp liquid soap, and 1 gallon of water. Spray on affected foliage.",
        suppliesNeeded: ["baking soda", "spray bottle"]
    },
    "leaf miners": {
        treatment: "Manual Removal & Spinosad",
        frequency: "Check daily, spray weekly if severe",
        instructions: "Squish the larvae inside the leaf tunnels by hand. For severe infestations, apply organic Spinosad.",
        suppliesNeeded: ["spinosad organic spray"]
    },
    "whiteflies": {
        treatment: "Yellow Sticky Traps & Neem",
        frequency: "Continuous traps, spray neem weekly",
        instructions: "Hang yellow sticky traps near the plant. Whiteflies are attracted to the color. Follow up with neem spray.",
        suppliesNeeded: ["yellow sticky traps", "neem oil"]
    }
};

export const VOLUNTEERS = [
    { id: "v1", name: "Suresh P.", distanceKm: 0.5, interests: ["planting", "watering"] },
    { id: "v2", name: "Rina K.", distanceKm: 1.2, interests: ["composting", "planting"] },
    { id: "v3", name: "Amit S.", distanceKm: 2.1, interests: ["organizing", "heavy lifting"] },
    { id: "v4", name: "Geeta V.", distanceKm: 0.8, interests: ["seed saving", "weeding"] },
    { id: "v5", name: "Farhan M.", distanceKm: 1.5, interests: ["soil prep", "carpentry for raised beds"] },
    { id: "v6", name: "Lakshmi R.", distanceKm: 3.0, interests: ["painting pots", "community outreach"] }
];
