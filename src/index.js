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
    fetch(`https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${api_key}&pageSize=10&query=${query}`)
        .then((res) => res.json())
        .then((data) => {
            const response = new FoodItems(data.totalHits, data.currentPage, data.totalPages, data.foods);
            res.send(response);
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
            foodItem.foodNutrients.forEach((nutrient) => {
                foodNutrientStorage.push(new FoodNutrients(nutrient.nutrientName, nutrient.unitName, nutrient.derivationDescription, nutrient.value));
            });
            foodStorage.push(new FoodDetails(foodItem.fdcId, foodItem.description, foodNutrientStorage));
        });
        this.foods = foodStorage;


    }
}

class FoodDetails {
    constructor(fdcId, description, foodNutrients) {
        this.fdcId = fdcId;
        this.description = description;
        this.foodNutrients = foodNutrients;
    }
}

class FoodNutrients {
    constructor(nutrientName, unitName, derivationDescription, value) {
        this.nutrientName = nutrientName;
        this.unitName = unitName;
        this.derivationDescription = derivationDescription;
        this.value = value;
    }
}