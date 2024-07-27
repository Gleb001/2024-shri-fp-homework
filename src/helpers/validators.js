// Задание ================================================== //
/**
 * @file Домашка по FP ч. 1
 *
 * Основная задача — написать самому, или найти в FP библиотеках функции anyPass/allPass
 * Эти функции/их аналоги есть и в ramda и в lodash
 *
 * allPass — принимает массив функций-предикатов, и возвращает функцию-предикат, которая
 * вернет true для заданного списка аргументов, если каждый из предоставленных предикатов
 * удовлетворяет этим аргументам (возвращает true)
 *
 * anyPass — то же самое, только удовлетворять значению может единственная функция-предикат из массива.
 *
 * Если какие либо функции написаны руками (без использования библиотек) это не является ошибкой
 */

// Примечание =============================================== //
/**
 * Привет!
 * В задании приведены два решения, где:
 * 1) То как необходимо было сделать по заданию;
 * 2) То как бы я написал, если бы не придерживался 
 * условию задания ( сделал, так как было больно смотреть на 
 * 1 решение ;) ).
 */

// Решение 1 ================================================ //

// Вспомогательные функции ---------------------------------- //

/**
 * Проверяем на истинность все переданные предикаты:
 * true - все предикаты истинны
 * false - один из предикатов ложен
 * 
 * @param {Array<function(): boolean>} predicates - список предикатов
 * @returns {boolean} - результат проверки
 */
const allPass = conditions => conditions.every(condition => condition());

/**
 * Проверяем, что хотя бы один из предикатов истин:
 * true - один из предикатов истин
 * false - все предикаты ложны 
 * 
 * @param {Array<function(): boolean>} predicates - список предикатов
 * @returns {boolean} - результат проверки
 */
const anyPass = conditions => conditions.some(condition => condition());

/**
 * Возвращает функцию, которая подсчитывает количество значений в объекте, 
 * удовлетворяющих заданному условию.
 *
 * @param {function(any): boolean} condition - Условие, которому должны удовлетворять значения объекта.
 * @returns {function(Object): number} Функция, принимающая объект и возвращающая количество значений, удовлетворяющих условию.
 */
function getLength(condition) {
    return function (object) {
        return (
            Object
                .values(object)
                .reduce((counter, value) => {

                    if (condition(value)) {
                        counter++;
                    }

                    return counter;

                }, 0)
        );
    }
}

/**
 * Подсчитывает количество каждого значения в объекте и возвращает объект с этими подсчетами.
 *
 * @param {Object} object - Объект, значения которого будут подсчитаны.
 * @returns {Object} Объект, где ключи - это уникальные значения исходного объекта, 
 * а значения - количество их вхождений.
 */
function getCounterValues(object) {
    return (
        Object
            .values(object)
            .reduce((accumulator, value) => {

                if (accumulator[value] === undefined) {
                    accumulator[value] = 0;
                }

                accumulator[value]++;
                return accumulator;

            }, {})
    );
}

// color functions
const isWhite = (shape) => shape === "white";
const isRed = (shape) => shape === "red";
const isGreen = (shape) => shape === "green";
const isOrange = (shape) => shape === "orange";
const isBlue = (shape) => shape === "blue";
const isAnyColor = (shape) => anyPass(
    [
        () => isWhite(shape),
        () => isRed(shape),
        () => isGreen(shape),
        () => isOrange(shape),
        () => isBlue(shape),
    ]
);

// Пукты ---------------------------------------------------- //

// 1. Красная звезда, зеленый квадрат, все остальные белые. 
export const validateFieldN1 = ({ star, square, triangle, circle }) => (
    allPass(
        [
            () => isRed(star),
            () => isGreen(square),
            () => isWhite(triangle),
            () => isWhite(circle)
        ]
    )
);

// 2. Как минимум две фигуры зеленые.
export const validateFieldN2 = shapes => (
    getLength(isGreen)(shapes) > 1
);

// 3. Количество красных фигур равно кол-ву синих.
export const validateFieldN3 = (shapes) => (
    getLength(isRed)(shapes) === getLength(isBlue)(shapes)
);

// 4. Синий круг, красная звезда, оранжевый квадрат треугольник любого цвета
export const validateFieldN4 = ({ star, square, triangle, circle }) => (
    allPass(
        [
            () => isRed(star),
            () => isOrange(square),
            () => isAnyColor(triangle),
            () => isBlue(circle),
        ]
    )
);

// 5. Три фигуры одного любого цвета кроме белого (четыре фигуры одного цвета – это тоже true).
export const validateFieldN5 = (shapes) => {
    const counters = getCounterValues(shapes);
    const hasThreeColor = Object.values(counters).find(counter => counter >= 3);
    return (hasThreeColor && (counters.white === undefined || counters.white < 2));
};

// 6. Ровно две зеленые фигуры (одна из зелёных – это треугольник), плюс одна красная. Четвёртая оставшаяся любого доступного цвета, но не нарушающая первые два условия
export const validateFieldN6 = (shapes) => (
    allPass(
        [
            () => getLength(isGreen)(shapes) === 2,
            () => getLength(isRed)(shapes) === 1,
            () => isGreen(shapes.triangle)
        ]
    )
)

// 7. Все фигуры оранжевые.
export const validateFieldN7 = (shapes) => (
    getLength(isOrange)(shapes) === Object.keys(shapes).length
);

// 8. Не красная и не белая звезда, остальные – любого цвета.
export const validateFieldN8 = ({ star, triangle, circle, square }) => (
    allPass(
        [
            () => isAnyColor(triangle),
            () => isAnyColor(square),
            () => isAnyColor(circle),
        ]
    ) &&
    !anyPass(
        [
            () => isRed(star),
            () => isWhite(star),
        ]
    )
);

// 9. Все фигуры зеленые.
export const validateFieldN9 = (shapes) => (
    getLength(isGreen)(shapes) === Object.keys(shapes).length
);

// 10. Треугольник и квадрат одного цвета (не белого), остальные – любого цвета
export const validateFieldN10 = ({ triangle, circle, star, square }) => (
    allPass(
        [
            () => (triangle === square),
            () => !isWhite(triangle),
            () => isAnyColor(circle),
            () => isAnyColor(star),
        ]
    )
);

// Решение 2 ================================================ //

// Вспомогательные функции ---------------------------------- //

// /**
//  * Считаем количество цветов у полученных фигур
//  * @param {{star, square, triangle, circle }} figures - фигуры, цвета которых необходимо посчитать
//  * @param {string[]} [countColors=undefined] - цвета, которые нам необходимо посчитать
//  * @returnscountColors
//  */
// function getCounterByValue(figures, countColors) {

//     const [setCountColors, defaultCounterValues] = countColors.reduce(([setCountColors, defaultCounterValues], countColor) => {
//         setCountColors.add(countColor);
//         defaultCounterValues[countColor] = 0;
//         return [setCountColors, defaultCounterValues];
//     }, [new Set, {}])

//     return (
//         Object
//             .values(figures)
//             .reduce((result, color) => {
//                 if (countColors === undefined || setCountColors.has(color)) {
//                     if (!result[color]) {
//                         result[color] = 0;
//                     }
//                     result[color]++;
//                 }
//                 return result;
//             }, defaultCounterValues)
//     );

// }

// Пукты ---------------------------------------------------- //

// // 1. Красная звезда, зеленый квадрат, все остальные белые. 
// export const validateFieldN1 = ({ star, square, triangle, circle }) => (
//     star === "red" &&
//     square === "green" &&
//     triangle === "white" &&
//     circle === "white"
// );

// // 2. Как минимум две фигуры зеленые.
// export const validateFieldN2 = (inputFigures) => {
//     const { green } = getCounterByValue(inputFigures, ["green"]);
//     return (green > 1);
// };

// // 3. Количество красных фигур равно кол-ву синих.
// export const validateFieldN3 = (inputFigures) => {
//     const { red, blue } = getCounterByValue(inputFigures, ["red", "blue"]);
//     return (red === blue);
// };

// // 4. Синий круг, красная звезда, оранжевый квадрат треугольник любого цвета
// export const validateFieldN4 = ({ star, square, circle }) => (
//     star   === "red"    &&
//     square === "orange" &&
//     circle === "blue"
// );

// // 5. Три фигуры одного любого цвета кроме белого (четыре фигуры одного цвета – это тоже true). !!!
// export const validateFieldN5 = (inputFigures) => {
//     const counterColors = getCounterByValue(inputFigures);
//     return (
//         Boolean(counterColors.white) < 2 &&
//         undefined !== Object.values(counterColors).find(counter => counter >= 3)
//     );
// };

// // 6. Ровно две зеленые фигуры (одна из зелёных – это треугольник), плюс одна красная. Четвёртая оставшаяся любого доступного цвета, но не нарушающая первые два условия
// export const validateFieldN6 = (inputFigures) => {
//     const { green, red } = getCounterByValue(inputFigures);
//     return (
//         green === 2 &&
//         inputFigures.triangle === "green" &&
//         red === 1
//     );
// };

// // 7. Все фигуры оранжевые.
// export const validateFieldN7 = (inputFigures) => {
//     const { orange } = getCounterByValue(inputFigures, ["orange"]);
//     return (orange === Object.keys(inputFigures).length);
// };

// // 8. Не красная и не белая звезда, остальные – любого цвета.
// export const validateFieldN8 = ({ star }) => (
//     star !== "red" &&
//     star !== "white"
// );

// // 9. Все фигуры зеленые.
// export const validateFieldN9 = (inputFigures) => {
//     const { green } = getCounterByValue(inputFigures, ["green"]);
//     return (green === Object.keys(inputFigures).length);
// };

// // 10. Треугольник и квадрат одного цвета (не белого), остальные – любого цвета
// export const validateFieldN10 = ({ triangle, square }) => (
//     triangle === square
// );