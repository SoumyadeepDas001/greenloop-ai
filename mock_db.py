# Mock Database for Python Agents

# Used by the new Plantation Guide Agent
PLANT_KB = [
    {
        "id": "p1",
        "species": "Marigold (Genda)",
        "difficulty": 1,
        "pollinator_friendly": True,
        "suitable_spaces": ['Balcony (Pots/Containers)', 'Rooftop Garden', 'Community Plot', 'Backyard/Ground Bed'],
        "season": ['summer', 'monsoon', 'winter'],
        "watering": "Every 2-3 days",
        "sunlight": "Full sun, 6-8 hours a day",
        "soilPH": "6.0 - 7.0",
        "commonIssues": ["Spider mites", "Powdery mildew", "Root rot"]
    },
    {
        "id": "p2",
        "species": "Hibiscus (Gudhal)",
        "difficulty": 3,
        "pollinator_friendly": True,
        "suitable_spaces": ['Balcony (Pots/Containers)', 'Rooftop Garden', 'Community Plot', 'Backyard/Ground Bed'],
        "season": ['summer', 'monsoon']
    },
    {
        "id": "p3",
        "species": "Tulsi (Holy Basil)",
        "difficulty": 1,
        "pollinator_friendly": False,
        "suitable_spaces": ['Balcony (Pots/Containers)', 'Windowsill', 'Rooftop Garden', 'Community Plot', 'Backyard/Ground Bed'],
        "season": ['summer', 'monsoon', 'winter']
    },
    {
        "id": "p4",
        "species": "Jasmine (Mogra)",
        "difficulty": 3,
        "pollinator_friendly": True,
        "suitable_spaces": ['Balcony (Pots/Containers)', 'Rooftop Garden', 'Community Plot', 'Backyard/Ground Bed'],
        "season": ['summer', 'monsoon']
    },
    {
        "id": "p5",
        "species": "Rose (Gulab)",
        "difficulty": 3,
        "pollinator_friendly": True,
        "suitable_spaces": ['Balcony (Pots/Containers)', 'Rooftop Garden', 'Community Plot', 'Backyard/Ground Bed'],
        "season": ['winter', 'spring']
    },
    {
        "id": "p6",
        "species": "Neem Tree",
        "difficulty": 1,
        "pollinator_friendly": True,
        "suitable_spaces": ['Community Plot', 'Backyard/Ground Bed'],
        "season": ['summer', 'monsoon', 'winter', 'spring']
    },
    {
        "id": "p7",
        "species": "Lotus (Kamal)",
        "difficulty": 5,
        "pollinator_friendly": True,
        "suitable_spaces": ['Backyard/Ground Bed'],
        "season": ['summer', 'monsoon']
    },
    {
        "id": "p8",
        "species": "Money Plant (Pothos)",
        "difficulty": 1,
        "pollinator_friendly": False,
        "suitable_spaces": ['Balcony (Pots/Containers)', 'Windowsill', 'Vertical Wall Garden', 'Indoor Space'],
        "season": ['summer', 'monsoon', 'winter', 'spring']
    },
    {
        "id": "p9",
        "species": "Aloe Vera",
        "difficulty": 1,
        "pollinator_friendly": False,
        "suitable_spaces": ['Balcony (Pots/Containers)', 'Windowsill', 'Rooftop Garden', 'Backyard/Ground Bed'],
        "season": ['summer', 'monsoon', 'winter', 'spring']
    },
    {
        "id": "p10",
        "species": "Curry Leaf (Kadi Patta)",
        "difficulty": 3,
        "pollinator_friendly": True,
        "suitable_spaces": ['Balcony (Pots/Containers)', 'Rooftop Garden', 'Community Plot', 'Backyard/Ground Bed'],
        "season": ['summer', 'monsoon', 'spring']
    },
    {
        "id": "p11",
        "species": "Bougainvillea",
        "difficulty": 1,
        "pollinator_friendly": True,
        "suitable_spaces": ['Rooftop Garden', 'Community Plot', 'Backyard/Ground Bed', 'Vertical Wall Garden'],
        "season": ['summer', 'spring']
    },
    {
        "id": "p12",
        "species": "Areca Palm",
        "difficulty": 3,
        "pollinator_friendly": False,
        "suitable_spaces": ['Balcony (Pots/Containers)', 'Backyard/Ground Bed', 'Indoor Space'],
        "season": ['summer', 'monsoon', 'winter', 'spring']
    },
    {
        "id": "f1",
        "species": "Sunflower (Surajmukhi)",
        "difficulty": 1,
        "pollinator_friendly": True,
        "suitable_spaces": ['Rooftop Garden', 'Community Plot', 'Backyard/Ground Bed'],
        "season": ['summer', 'spring']
    },
    {
        "id": "f2",
        "species": "Zinnia",
        "difficulty": 1,
        "pollinator_friendly": True,
        "suitable_spaces": ['Balcony (Pots/Containers)', 'Rooftop Garden', 'Community Plot', 'Backyard/Ground Bed'],
        "season": ['summer', 'monsoon']
    },
    {
        "id": "f3",
        "species": "Petunia",
        "difficulty": 3,
        "pollinator_friendly": True,
        "suitable_spaces": ['Balcony (Pots/Containers)', 'Vertical Wall Garden', 'Rooftop Garden'],
        "season": ['winter', 'spring']
    },
    {
        "id": "f4",
        "species": "Chrysanthemum",
        "difficulty": 3,
        "pollinator_friendly": True,
        "suitable_spaces": ['Balcony (Pots/Containers)', 'Rooftop Garden', 'Community Plot', 'Backyard/Ground Bed'],
        "season": ['winter']
    },
    {
        "id": "f5",
        "species": "Orchid",
        "difficulty": 5,
        "pollinator_friendly": False,
        "suitable_spaces": ['Windowsill', 'Indoor Space'],
        "season": ['summer', 'spring']
    },
    {
        "id": "h1",
        "species": "Mint (Pudina)",
        "difficulty": 1,
        "pollinator_friendly": False,
        "suitable_spaces": ['Balcony (Pots/Containers)', 'Windowsill', 'Vertical Wall Garden'],
        "season": ['summer', 'monsoon', 'spring']
    },
    {
        "id": "h2",
        "species": "Coriander (Dhania)",
        "difficulty": 3,
        "pollinator_friendly": False,
        "suitable_spaces": ['Balcony (Pots/Containers)', 'Windowsill', 'Community Plot'],
        "season": ['winter', 'spring']
    },
    {
        "id": "v1",
        "species": "Tomato",
        "difficulty": 3,
        "pollinator_friendly": True,
        "suitable_spaces": ['Balcony (Pots/Containers)', 'Rooftop Garden', 'Community Plot', 'Backyard/Ground Bed'],
        "season": ['winter', 'spring', 'summer']
    },
    {
        "id": "p2",
        "species": "Hibiscus",
        "difficulty": 3,
        "pollinator_friendly": True,
        "suitable_spaces": ["balcony", "rooftop", "community plot", "backyard"],
        "season": ["summer", "monsoon"]
    },
    {
        "id": "p3",
        "species": "Tulsi",
        "difficulty": 2,
        "pollinator_friendly": False,
        "suitable_spaces": ["balcony", "windowsill", "rooftop", "community plot", "backyard"],
        "season": ["summer", "monsoon", "winter"]
    },
    {
        "id": "p4",
        "species": "Money Plant",
        "difficulty": 1,
        "pollinator_friendly": False,
        "suitable_spaces": ["balcony", "windowsill", "vertical wall"],
        "season": ["summer", "monsoon", "winter", "spring"]
    },
    {
        "id": "p5",
        "species": "Lotus",
        "difficulty": 4,
        "pollinator_friendly": True,
        "suitable_spaces": ["backyard"],
        "season": ["summer", "monsoon"]
    }
]

# Used by the new Recyclable Sorting Agent
RECYCLING_FACILITIES = [
    {
        "name": "City E-Waste Center",
        "lat": 12.9300,
        "lon": 77.6000,
        "accepted_categories": ["E-waste", "Glass"]
    },
    {
        "name": "GreenPlast Recycling",
        "lat": 12.9500,
        "lon": 77.5800,
        "accepted_categories": ["Plastic Type 1-7"]
    },
    {
        "name": "General Recycling Hub",
        "lat": 12.9700,
        "lon": 77.5900,
        "accepted_categories": ["Plastic Type 1-7", "Glass", "Mixed"]
    },
    {
        "name": "Tech Scrap Facility",
        "lat": 12.9900,
        "lon": 77.6100,
        "accepted_categories": ["E-waste"]
    }
]
