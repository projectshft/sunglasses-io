let { expect } = require('chai');
let Brands = require('./brands');

describe('Brands', () => {
  describe('length should', () => {
    it('be 5', () => {
      // arrange
      let brands = new Brands([
        {
          "id": "1",
          "name" : "Oakley"
      },
      {
          "id": "2",
          "name" : "Ray Ban"
      },
      {
          "id": "3",
          "name" : "Levi's"
      },
      {
          "id": "4",
          "name" : "DKNY"
      },
      {
          "id": "5",
          "name" : "Burberry"
      }
      ]);
      // act
      let length = brands.length;
      // assert
      expect(length).to.have.lengthOf(5);
    });
    
       
      
      
      })
    })
  


  

