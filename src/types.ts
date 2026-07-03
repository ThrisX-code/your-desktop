export type Category = 'Coding' | 'Study' | 'Hardware' | 'General';

export interface Task {
  id: string;
  name: string;
  category: Category;
  duration: number;
  context: string;
  completed: boolean;
  createdAt: number;
}
