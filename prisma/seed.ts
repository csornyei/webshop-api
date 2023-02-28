import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  await prisma.category.create({
    data: {
      name: "Fruit and vegetables",
      childCategories: {
        create: [
          {
            name: "Fruit",
            childCategories: {
              create: [
                {
                  name: "Citrus",
                  products: {
                    create: [
                      {
                        name: "Orange",
                        price: 150,
                        description: "A delicious orange",
                      },
                      {
                        name: "Lemon",
                        price: 150,
                        description: "A delicious lemon",
                      },
                    ],
                  },
                },
                {
                  name: "Berries",
                  products: {
                    create: [
                      {
                        name: "Strawberry",
                        price: 150,
                        description: "A delicious strawberry",
                      },
                      {
                        name: "Blueberry",
                        price: 150,
                        description: "A delicious blueberry",
                      },
                    ],
                  },
                },
                {
                  name: "Exotic",
                  products: {
                    create: [
                      {
                        name: "Pineapple",
                        price: 150,
                        description: "A delicious pineapple",
                      },
                      {
                        name: "Mango",
                        price: 150,
                        description: "A delicious mango",
                      },
                    ],
                  },
                },
                {
                  name: "Apples",
                  products: {
                    create: [
                      {
                        name: "Red apple",
                        price: 150,
                        description: "A delicious red apple",
                      },
                      {
                        name: "Green apple",
                        price: 150,
                        description: "A delicious green apple",
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            name: "Vegetables",
            childCategories: {
              create: [
                {
                  name: "Root vegetables",
                  products: {
                    create: [
                      {
                        name: "Potato",
                        price: 150,
                        description: "A delicious potato",
                      },
                      {
                        name: "Carrot",
                        price: 150,
                        description: "A delicious carrot",
                      },
                    ],
                  },
                },
                {
                  name: "Leafy vegetables",
                  products: {
                    create: [
                      {
                        name: "Lettuce",
                        price: 150,
                        description: "A delicious lettuce",
                      },
                      {
                        name: "Spinach",
                        price: 150,
                        description: "A delicious spinach",
                      },
                    ],
                  },
                },
                {
                  name: "Cucumber and Tomato",
                  products: {
                    create: [
                      {
                        name: "Cucumber",
                        price: 150,
                        description: "A delicious cucumber",
                      },
                      {
                        name: "Tomato",
                        price: 150,
                        description: "A delicious fruit",
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  });
  await prisma.category.create({
    data: {
      name: "Meat and fish",
      childCategories: {
        create: [
          {
            name: "Chicken",
            products: {
              create: [
                {
                  name: "Chicken breast",
                  price: 150,
                  description: "A delicious chicken breast",
                },
                {
                  name: "Chicken thigh",
                  price: 150,
                  description: "A delicious chicken thigh",
                },
              ],
            },
          },
          {
            name: "Beef",
            products: {
              create: [
                {
                  name: "Beef steak",
                  price: 150,
                  description: "A delicious beef steak",
                },
                {
                  name: "Beef mince",
                  price: 150,
                  description: "A delicious beef mince",
                },
              ],
            },
          },
          {
            name: "Fish",
            products: {
              create: [
                {
                  name: "Salmon",
                  price: 150,
                  description: "A delicious salmon",
                },
                {
                  name: "Tuna",
                  price: 150,
                  description: "A delicious tuna",
                },
              ],
            },
          },
        ],
      },
    },
  });
  await prisma.category.create({
    data: {
      name: "Dairy",
      childCategories: {
        create: [
          {
            name: "Milk",
            products: {
              create: [
                {
                  name: "Milk",
                  price: 150,
                  description: "A delicious milk",
                },
                {
                  name: "Soy milk",
                  price: 150,
                  description: "A delicious soy milk",
                },
                {
                  name: "Goat milk",
                  price: 150,
                  description: "A delicious goat milk",
                },
              ],
            },
          },
          {
            name: "Cheese",
            products: {
              create: [
                {
                  name: "Cheddar",
                  price: 150,
                  description: "A delicious cheddar",
                },
                {
                  name: "Mozzarella",
                  price: 150,
                  description: "A delicious mozzarella",
                },
                {
                  name: "Gouda",
                  price: 150,
                  description: "A delicious gouda",
                },
              ],
            },
          },
        ],
      },
    },
  });
  await prisma.category.create({
    data: {
      name: "Drinks",
      childCategories: {
        create: [
          {
            name: "Water",
            products: {
              create: [
                {
                  name: "Still water",
                  price: 150,
                  description: "A delicious still water",
                },
                {
                  name: "Sparkling water",
                  price: 150,
                  description: "A delicious sparkling water",
                },
              ],
            },
          },
          {
            name: "Juice",
            products: {
              create: [
                {
                  name: "Orange juice",
                  price: 150,
                  description: "A delicious orange juice",
                },
                {
                  name: "Apple juice",
                  price: 150,
                  description: "A delicious apple juice",
                },
              ],
            },
          },
          {
            name: "Alcohol",
            childCategories: {
              create: [
                {
                  name: "Beer",
                  products: {
                    create: [
                      {
                        name: "Heineken",
                        price: 150,
                        description: "A delicious Heineken",
                      },
                      {
                        name: "Budweiser",
                        price: 150,
                        description: "A delicious Budweiser",
                      },
                    ],
                  },
                },
                {
                  name: "Wine",
                  products: {
                    create: [
                      {
                        name: "Red wine",
                        price: 150,
                        description: "A delicious red wine",
                      },
                      {
                        name: "White wine",
                        price: 150,
                        description: "A delicious white wine",
                      },
                    ],
                  },
                },
                {
                  name: "Spirits",
                  products: {
                    create: [
                      {
                        name: "Vodka",
                        price: 150,
                        description: "A delicious vodka",
                      },
                      {
                        name: "Whiskey",
                        price: 150,
                        description: "A delicious whiskey",
                      },
                      {
                        name: "Palinka",
                        price: 150,
                        description: "A delicious palinka",
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
