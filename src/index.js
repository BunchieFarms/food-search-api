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
            const response = new foodItems(data.totalHits, data.currentPage, data.totalPages, data.foods);
            res.send(response);
        });
});

app.listen(3001, () => {
    console.log('listening on 3001');
});

class foodItems {
    constructor(totalHits, currentPage, totalPages, foods) {
        this.totalHits = totalHits;
        this.currentPage = currentPage;
        this.totalPages = totalPages;

        let foodStorage = [];
        foods.forEach((foodItem) => {
            let foodNutrientStorage = [];
            foodItem.foodNutrients.forEach((nutrient) => {
                foodNutrientStorage.push({
                    nutrientName: nutrient.nutrientName,
                    unitName: nutrient.unitName,
                    derivationDescription: nutrient.derivationDescription,
                    value: nutrient.value
                });
            });
            foodStorage.push({
                fdcId: foodItem.fdcId,
                description: foodItem.description,
                foodNutrients: foodNutrientStorage
            });
        });
        this.foods = foodStorage;
    }
}