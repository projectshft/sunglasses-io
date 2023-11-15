// Type interfaces

export interface BrandObject {
  id: string;
  name: string;
}

export interface ProductObject {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  imageUrls: Array<string>;
}
