import fetch from 'node-fetch';
import express from 'express';
import bodyParser from 'body-parser';
import 'dotenv/config';

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const api_key = process.env.API_KEY;

app.post('/api/searchFood', (req, res) => {
    const query = req.body.query.trim().replace(' ', '%20');
    const page = req.body.page;
    fetch(`https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${api_key}&pageSize=10&pageNumber=${page}&query=${query}`)
        .then((res) => res.json())
        .then((data) => {
            const response = new FoodItems(data.totalHits, data.currentPage, data.totalPages, data.foods);
            res.send(response);
        })
        .catch((err) => {
            res.send(err);
        });
});

app.listen(3001, () => {
    console.log('listening on 3001');
});

class FoodItems {
    constructor(totalHits, currentPage, totalPages, foods) {
        this.totalHits = totalHits;
        this.currentPage = currentPage;
        this.totalPages = totalPages;

        let foodStorage = [];
        foods.forEach((foodItem) => {
            let foodNutrientStorage = [];
            const reqNumbers = ['203', '204', '205', '208', '269'];
            foodItem.foodNutrients.forEach((nutrient) => {
                if (reqNumbers.includes(nutrient.nutrientNumber))
                    foodNutrientStorage.push(new FoodNutrients(nutrient.nutrientName, nutrient.unitName, nutrient.derivationDescription, nutrient.value, nutrient.nutrientNumber));
            });
            foodStorage.push(new FoodDetails(foodItem.fdcId, foodItem.description, foodItem.brandName, foodNutrientStorage));
        });
        this.foods = foodStorage;


    }
}

class FoodDetails {
    constructor(fdcId, description, brandName, foodNutrients) {
        this.fdcId = fdcId;
        this.description = description;
        this.brandName = brandName;
        this.foodNutrients = foodNutrients;
    }
}

class FoodNutrients {
    constructor(nutrientName, unitName, derivationDescription, value, nutrientNumber) {
        this.nutrientName = nutrientName;
        this.unitName = unitName;
        this.derivationDescription = derivationDescription;
        this.value = value;
        this.nutrientNumber = nutrientNumber;
    }
}