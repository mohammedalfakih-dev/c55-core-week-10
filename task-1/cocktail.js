// API documentation: https://www.thecocktaildb.com/api.php

import { writeFile } from 'fs/promises';
import path from 'path';

const BASE_URL = 'https://www.thecocktaildb.com/api/json/v1/1';

// Add helper functions as needed here
function getAlcoholicLabel(alcoholicValue) {
  return alcoholicValue === 'Alcoholic' ? 'Yes' : 'No';
}

function getIngredients(drink) {
  const ingredients = [];

  for (let i = 1; i <= 15; i += 1) {
    const ingredient = drink[`strIngredient${i}`]?.trim();
    const measure = drink[`strMeasure${i}`]?.trim();

    if (!ingredient) {
      continue;
    }

    ingredients.push(`- ${measure ? `${measure} ` : ''}${ingredient}`);
  }

  return ingredients.join('\n');
}

function formatDrink(drink) {
  return [
    `## ${drink.strDrink}`,
    '',
    `![${drink.strDrink}](${drink.strDrinkThumb}/medium)`,
    '',
    `**Category**: ${drink.strCategory}`,
    '',
    `**Alcoholic**: ${getAlcoholicLabel(drink.strAlcoholic)}`,
    '',
    '### Ingredients',
    '',
    getIngredients(drink),
    '',
    '### Instructions',
    '',
    drink.strInstructions,
    '',
    `Serve in: ${drink.strGlass}`,
  ].join('\n');
}

function createMarkdown(drinks) {
  return `# Cocktail Recipes\n\n${drinks.map(formatDrink).join('\n\n')}`;
}

export async function main() {
  if (process.argv.length < 3) {
    console.error('Please provide a cocktail name as a command line argument.');
    return;
  }

  const cocktailName = process.argv[2];
  const url = `${BASE_URL}/search.php?s=${cocktailName}`;

  const __dirname = import.meta.dirname;
  const outPath = path.join(__dirname, `./output/${cocktailName}.md`);

  try {
    // 1. Fetch data from the API at the given URL
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch cocktail data. Status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.drinks) {
      throw new Error('No cocktails found with that name.');
    }

    // 2. Generate markdown content to match the examples
    const markdown = createMarkdown(data.drinks);

    // 3. Write the generated content to a markdown file as given by outPath
    await writeFile(outPath, markdown);
  } catch (error) {
    // 4. Handle errors
    console.error(`Error: ${error.message}`);
  }
}

// Do not change the code below
if (!process.env.VITEST) {
  main();
}
