'use client';

import { useState } from 'react';

const menuCategories = [
  {
    category: 'Appetizers',
    items: [
      {
        name: 'Bruschetta Trio',
        description: 'Three varieties of toasted bread with fresh tomatoes, basil, and olive oil',
        price: '15,000 RWF',
        dietary: ['Vegetarian'],
      },
      {
        name: 'Crispy Calamari',
        description: 'Lightly breaded squid served with marinara sauce and lemon',
        price: '19,000 RWF',
        dietary: [],
      },
      {
        name: 'Stuffed Mushrooms',
        description: 'Button mushrooms filled with herbs, cheese, and breadcrumbs',
        price: '14,000 RWF',
        dietary: ['Vegetarian'],
      },
      {
        name: 'Shrimp Cocktail',
        description: 'Jumbo shrimp served with tangy cocktail sauce',
        price: '20,000 RWF',
        dietary: ['Gluten-Free'],
      },
    ],
  },
  {
    category: 'Main Courses',
    items: [
      {
        name: 'Grilled Salmon',
        description: 'Fresh Atlantic salmon with lemon butter sauce, vegetables, and rice',
        price: '35,000 RWF',
        dietary: ['Gluten-Free'],
      },
      {
        name: 'Filet Mignon',
        description: '8oz premium beef tenderloin with mashed potatoes and asparagus',
        price: '52,000 RWF',
        dietary: ['Gluten-Free'],
      },
      {
        name: 'Chicken Parmesan',
        description: 'Breaded chicken breast topped with marinara and mozzarella, served with pasta',
        price: '30,000 RWF',
        dietary: [],
      },
      {
        name: 'Vegetable Risotto',
        description: 'Creamy arborio rice with seasonal vegetables and parmesan',
        price: '27,000 RWF',
        dietary: ['Vegetarian', 'Gluten-Free'],
      },
      {
        name: 'Lobster Linguine',
        description: 'Fresh lobster tail with garlic cream sauce over linguine pasta',
        price: '47,000 RWF',
        dietary: [],
      },
      {
        name: 'Lamb Chops',
        description: 'Herb-crusted lamb chops with roasted potatoes and mint sauce',
        price: '45,000 RWF',
        dietary: ['Gluten-Free'],
      },
    ],
  },
  {
    category: 'Pasta',
    items: [
      {
        name: 'Spaghetti Carbonara',
        description: 'Classic Italian pasta with pancetta, egg, and pecorino romano',
        price: '24,000 RWF',
        dietary: [],
      },
      {
        name: 'Penne Arrabbiata',
        description: 'Spicy tomato sauce with garlic and red chili peppers',
        price: '21,000 RWF',
        dietary: ['Vegetarian', 'Vegan'],
      },
      {
        name: 'Fettuccine Alfredo',
        description: 'Rich and creamy parmesan sauce over fettuccine',
        price: '22,000 RWF',
        dietary: ['Vegetarian'],
      },
      {
        name: 'Seafood Linguine',
        description: 'Shrimp, mussels, and clams in white wine garlic sauce',
        price: '32,000 RWF',
        dietary: [],
      },
    ],
  },
  {
    category: 'Desserts',
    items: [
      {
        name: 'Tiramisu',
        description: 'Classic Italian dessert with espresso-soaked ladyfingers and mascarpone',
        price: '11,000 RWF',
        dietary: ['Vegetarian'],
      },
      {
        name: 'Chocolate Lava Cake',
        description: 'Warm chocolate cake with a molten center, served with vanilla ice cream',
        price: '12,000 RWF',
        dietary: ['Vegetarian'],
      },
      {
        name: 'Panna Cotta',
        description: 'Silky vanilla cream with berry compote',
        price: '10,000 RWF',
        dietary: ['Vegetarian', 'Gluten-Free'],
      },
      {
        name: 'Cannoli',
        description: 'Crispy pastry shells filled with sweet ricotta and chocolate chips',
        price: '10,000 RWF',
        dietary: ['Vegetarian'],
      },
    ],
  },
  {
    category: 'Beverages',
    items: [
      {
        name: 'Fresh Lemonade',
        description: 'House-made with fresh lemons and mint',
        price: '6,000 RWF',
        dietary: ['Vegan', 'Gluten-Free'],
      },
      {
        name: 'Italian Soda',
        description: 'Choice of flavors: raspberry, vanilla, or peach',
        price: '7,500 RWF',
        dietary: ['Vegetarian', 'Gluten-Free'],
      },
      {
        name: 'Espresso',
        description: 'Rich and bold Italian espresso',
        price: '5,000 RWF',
        dietary: ['Vegan', 'Gluten-Free'],
      },
      {
        name: 'House Wine',
        description: 'Red or white, glass or bottle',
        price: '10,000-40,000 RWF',
        dietary: ['Vegan', 'Gluten-Free'],
      },
    ],
  },
  {
    category: 'Salads',
    items: [
      {
        name: 'Caesar Salad',
        description: 'Crisp romaine lettuce with parmesan, croutons, and Caesar dressing',
        price: '13,000 RWF',
        dietary: ['Vegetarian'],
      },
      {
        name: 'Greek Salad',
        description: 'Fresh vegetables with feta cheese, olives, and olive oil',
        price: '14,000 RWF',
        dietary: ['Vegetarian', 'Gluten-Free'],
      },
      {
        name: 'Caprese Salad',
        description: 'Fresh mozzarella, tomatoes, and basil with balsamic glaze',
        price: '15,000 RWF',
        dietary: ['Vegetarian', 'Gluten-Free'],
      },
      {
        name: 'Garden Salad',
        description: 'Mixed greens with seasonal vegetables and house dressing',
        price: '11,000 RWF',
        dietary: ['Vegan', 'Gluten-Free'],
      },
    ],
  },
  {
    category: 'Soups',
    items: [
      {
        name: 'French Onion Soup',
        description: 'Caramelized onions in rich beef broth with melted cheese',
        price: '12,000 RWF',
        dietary: [],
      },
      {
        name: 'Tomato Basil Soup',
        description: 'Creamy tomato soup with fresh basil',
        price: '10,000 RWF',
        dietary: ['Vegetarian'],
      },
      {
        name: 'Seafood Chowder',
        description: 'Rich and creamy soup with fresh seafood',
        price: '16,000 RWF',
        dietary: [],
      },
      {
        name: 'Minestrone',
        description: 'Italian vegetable soup with pasta and beans',
        price: '11,000 RWF',
        dietary: ['Vegan'],
      },
    ],
  },
  {
    category: 'Pizzas',
    items: [
      {
        name: 'Margherita Pizza',
        description: 'Classic pizza with tomato sauce, mozzarella, and fresh basil',
        price: '18,000 RWF',
        dietary: ['Vegetarian'],
      },
      {
        name: 'Pepperoni Pizza',
        description: 'Traditional pizza with pepperoni and mozzarella',
        price: '20,000 RWF',
        dietary: [],
      },
      {
        name: 'Quattro Formaggi',
        description: 'Four cheese pizza with mozzarella, gorgonzola, parmesan, and fontina',
        price: '22,000 RWF',
        dietary: ['Vegetarian'],
      },
      {
        name: 'Vegetarian Supreme',
        description: 'Loaded with fresh vegetables and mozzarella',
        price: '19,000 RWF',
        dietary: ['Vegetarian'],
      },
    ],
  },
  {
    category: 'Sides',
    items: [
      {
        name: 'French Fries',
        description: 'Crispy golden fries with sea salt',
        price: '5,000 RWF',
        dietary: ['Vegan'],
      },
      {
        name: 'Garlic Bread',
        description: 'Toasted bread with garlic butter and herbs',
        price: '6,000 RWF',
        dietary: ['Vegetarian'],
      },
      {
        name: 'Grilled Vegetables',
        description: 'Seasonal vegetables grilled with olive oil and herbs',
        price: '8,000 RWF',
        dietary: ['Vegan', 'Gluten-Free'],
      },
      {
        name: 'Mac and Cheese',
        description: 'Creamy macaroni with three cheeses',
        price: '9,000 RWF',
        dietary: ['Vegetarian'],
      },
    ],
  },
];

export default function MenuPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredMenu = selectedCategory === 'All'
    ? menuCategories
    : menuCategories.filter(cat => cat.category === selectedCategory);

  return (
    <main className="min-h-screen bg-white">
      <div className="flex">
        {/* Sidebar Category Filter */}
        <aside className="w-64 bg-[#F8F4F0] h-screen fixed top-0 left-0 border-r border-gray-200 flex flex-col">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-[#333333]">Categories</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setSelectedCategory('All')}
                className={`px-4 py-3 rounded-lg font-semibold text-left transition-all ${
                  selectedCategory === 'All'
                    ? 'bg-[#FF6B35] text-white shadow-md'
                    : 'bg-white text-[#333333] hover:bg-[#FF6B35] hover:text-white'
                }`}
              >
                All
              </button>
              {menuCategories.map((cat) => (
                <button
                  key={cat.category}
                  onClick={() => setSelectedCategory(cat.category)}
                  className={`px-4 py-3 rounded-lg font-semibold text-left transition-all ${
                    selectedCategory === cat.category
                      ? 'bg-[#FF6B35] text-white shadow-md'
                      : 'bg-white text-[#333333] hover:bg-[#FF6B35] hover:text-white'
                  }`}
                >
                  {cat.category}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Menu Items */}
        <section className="flex-1 py-16 px-4 sm:px-6 lg:px-8 bg-white ml-64">
          <div className="max-w-6xl mx-auto">
          {filteredMenu.map((category) => (
            <div key={category.category} className="mb-16">
              <h2 className="text-3xl font-bold text-[#333333] mb-8 pb-4 border-b-2 border-[#FF6B35]">
                {category.category}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {category.items.map((item, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-lg p-6 shadow-md hover:shadow-xl transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-semibold text-[#333333]">{item.name}</h3>
                      <span className="text-[#FF6B35] font-bold text-lg ml-4">{item.price}</span>
                    </div>
                    <p className="text-[#333333] opacity-80 mb-4">{item.description}</p>
                    {item.dietary.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {item.dietary.map((diet) => (
                          <span
                            key={diet}
                            className="text-xs bg-[#F8F4F0] text-[#333333] px-3 py-1 rounded-full font-medium"
                          >
                            {diet}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
      </div>
    </main>
  );
}
