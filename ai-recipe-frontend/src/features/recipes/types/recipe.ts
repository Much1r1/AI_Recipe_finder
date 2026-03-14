import { ReactNode } from "react";

export interface Recipe {
    id: string;
    image: any;
    title: string;
    ingredients: string[];
    instructions: string[];
    ready_in_minutes: number;
    source_url?: string;
    estimated_cost_kes?: number;
    price_per_serving?: number;
    calories?: number;
    dietary_tags?: string[];
    protein_score?: number;
    protein_per_cost?: number;
    match_score?: number;
    explanation?: string[]; //No null
  }
  