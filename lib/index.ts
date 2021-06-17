interface MongooseSpecification {
  [key: string]: string | { id: string };
}

interface MongooseAction {
  [key: string]: MongooseSpecification;
}
interface EditOptions {
  [key: string]: MongooseAction;
}

interface Note {
  id: string;
  text: string;
}

interface Recipe {
  author: string;
  id: string;
  image: string;
  keywords: string[];
  name: string;
  notes: Note[];
  origin: string;
  recipeIngredient: string[];
  recipeInstructions: string[];
  recipeYield: string;
  url: string;
}

export { EditOptions, Recipe };
