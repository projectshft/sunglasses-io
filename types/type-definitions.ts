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

export interface ProductInCart extends ProductObject {
  quantity: number;
}

export interface AccessToken {
  username: string;
  lastUpdated: Date;
  token: string;
}

export interface User {
  gender: string;
  cart: Array<ProductInCart>;
  name: {
    title: string;
    first: string;
    last: string;
  };
  location: {
    street: string;
    city: string;
    state: string;
    postcode: number;
  };
  email: string;
  login: {
    username: string;
    password: string;
    salt: string;
    md5: string;
    sha1: string;
    sha256: string;
  };
  dob: string;
  registered: string;
  phone: string;
  cell: string;
  picture: {
    large: string;
    medium: string;
    thumbnail: string;
  };
  nat: string;
}
