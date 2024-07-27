// Задание ================================================== //
/**
 * @file Домашка по FP ч. 2
 *
 * Подсказки:
 * Метод get у инстанса Api – каррированый
 * GET / https://animals.tech/{id}
 *
 * GET / https://api.tech/numbers/base
 * params:
 * – number [Int] – число
 * – from [Int] – из какой системы счисления
 * – to [Int] – в какую систему счисления
 *
 * Иногда промисы от API будут приходить в состояние rejected, (прямо как и API в реальной жизни)
 * Ответ будет приходить в поле {result}
 */

// Примечание =============================================== //
/**
 * Привет!
 * В задании приведены два решения, где:
 * 1) без длинной цепочки вызовов;
 * 2) с длинной цепочкой вызовов.
 */

// Библиотека =============================================== //
import Api from '../tools/api';

// Вспомогательные функции ================================== //

/**
 * Проверяет на истинность все переданные предикаты.
 * 
 * @param {Array<function(): boolean>} conditions - список предикатов.
 * @returns {boolean} - результат проверки: true, если все предикаты истинны, иначе false.
 */
const allPass = conditions => conditions.every(condition => condition());

/**
 * Создает композицию из функций, вызываемых справа налево.
 * 
 * @param {...function} functions - Функции для композиции.
 * @returns {function} - Функция, принимающая начальное значение и возвращающая результат скомпонованных функций.
 */
const compose = (...functions) => (initialValue) => (
    functions.reduceRight((accumulator, func) => {
        let newValue = func(accumulator);
        if (newValue !== undefined) {
            return newValue;
        } else {
            return accumulator;
        }
    }, initialValue)
);

/**
 * Композиция нескольких асинхронных функций справа налево.
 *
 * @param {...Function} asyncFunctions - Асинхронные функции для композиции.
 * @returns {Function} - Функция, которая принимает начальное значение и возвращает промис, который разрешается в результат скомпонованных функций.
 */
const asyncCompose = (...asyncFunctions) => async (initialValue) => (
    await asyncFunctions.reduceRight(async (accumulator, func) => {
        let newValue = await func(await accumulator);
        if (newValue !== undefined) {
            return newValue;
        } else {
            return accumulator;
        }
    }, Promise.resolve(initialValue))
);

/**
 * Композиция нескольких асинхронных функций слева направо.
 * 
 * @param {...Function} asyncFunctions - Асинхронные функции для композиции.
 * @returns {Function} - Функция, которая принимает начальное значение и возвращает промис, который разрешается в результат скомпонованных функций.
 */
const asyncComposit = (...asyncFunctions) => async (initialValue) => {
    let prevValue = initialValue;
    return await asyncFunctions.reduce(async (accumulator, func) => {
        if (await accumulator !== undefined) prevValue = accumulator;
        return func(await accumulator || await prevValue);
    }, initialValue)
};

/**
 * Функция валидации условий.
 * 
 * @param {Function} handleError - Функция для обработки ошибок.
 * @returns {Function} - Функция, принимающая условие и сообщение, возвращающая функцию для проверки условия.
 */
const validateCondition = (handleError) => (condition, message) => () => {
    if (condition()) {
        handleError(message);
        return false;
    } else {
        return true;
    }
}

/**
 * Получает результат API запроса.
 * 
 * @param {Function} responseApi - Функция API запроса.
 * @returns {Promise<*>} - Промис, разрешающийся в результат API запроса.
 */
const getResultApi = async (responseApi) => await responseApi.result;

/**
 * Многократно вызывает API до получения успешного результата или достижения максимального количества попыток.
 *
 * @param {Function} api - Функция API, которая должна возвращать промис, разрешающийся в объект с полем 'result'.
 * @param {number} [steps=5] - Максимальное количество попыток вызова API.
 * @returns {Function} - Функция, принимающая данные и возвращающая ответ API в случае успеха, или объект с null результатом при неудаче.
 */
const getSuccessResultApi = (api, steps = 5) => async (data) => {
    for (let attempt = 0; attempt < steps; attempt++) {
        try {
            const response = await api(data);
            if (response.result) {
                return response;
            }
        } catch (error) {
            throw new Error(error.message);
        }
    }
};

// функции для расчета значений
const getSquared = (value) => Math.pow(value, 2);
const getRemainderDivisionOn = (divisor) => (value) => value % divisor;
const getLength = (string) => string.length;
const charsIn = (string) => (condition) => condition(string);

// функции-предикаты (булевые функции)
const isLessThan = (max) => (string) => string.length < max;
const isMoreThan = (min) => (string) => min < string.length;
const isNegative = (number) => number < 0;
const hasDigitAndPoint = (string) => /^\d+(\.\d+)?$/.test(string);
const not = (boolean) => !boolean;

// функции-ручки (получение данных через api)
const api = new Api();
const getBinary = async (value) => await api.get(
    'https://api.tech/numbers/base',
    {
        from: 10,
        to: 2,
        number: value
    }
);
const getAnimal = async (idAnimal) => await api.get(
    `https://animals.tech/${idAnimal}`,
    {}
);

// Решение 1 ================================================ //

// const processSequence = async ({ value, writeLog, handleSuccess, handleError }) => {

//     // 1. Берем строку N. Пишем изначальную строку в writeLog
//     writeLog(value);

//     // 2. Строка валидируется по правилам
//     const checkCondition = validateCondition(handleError);
//     const charsInValue = charsIn(value);
//     const isValidValue = allPass(
//         [
//             checkCondition(() => compose(isNaN, Number)(value), "строка не является числом"),
//             checkCondition(() => charsInValue(isMoreThan(9)), "кол-во символов в числе должно быть меньше 10"),
//             checkCondition(() => charsInValue(isLessThan(3)), "кол-во символов в числе должно быть больше 2"),
//             checkCondition(() => compose(isNegative, Number)(value), "число должно быть положительным"),
//             checkCondition(() => compose(not, hasDigitAndPoint)(value), "символы в строке только [0-9] и точка"),
//         ]
//     );
//     if (!isValidValue) return;

//     try {

//         // 3. Привести строку к числу, округлить к ближайшему целому с точностью до единицы, записать в writeLog
//         const roundedValue = compose(writeLog, Math.round, Number)(value);

//         // 4. C помощью API /numbers/base перевести из 10-й системы счисления в двоичную, результат записать в writeLog
//         const binaryValue = await asyncCompose(writeLog, getResultApi, getBinary)(roundedValue);

//         // 5. Взять кол-во символов в полученном от API числе записать в writeLog
//         const lengthBits = compose(writeLog, getLength)(binaryValue);

//         // 6. Возвести в квадрат с getRemainderDivisionпомощью Javascript записать в writeLog
//         const squareNumber = compose(writeLog, getSquared)(lengthBits);

//         // 7. Взять остаток от деления на 3, записать в writeLog
//         const remainderDivision = compose(writeLog, getRemainderDivisionOn(3))(squareNumber);

//         // 8. C помощью API /animals.tech/id/name получить случайное животное используя полученный остаток в качестве id
//         const animal = await asyncCompose(getResultApi, getAnimal)(remainderDivision);

//         // 9. Завершить цепочку вызовом handleSuccess в который в качестве аргумента положить результат полученный на предыдущем шаге
//         handleSuccess(animal);

//     } catch (error) {
//         handleError(error.message);
//     }

// }

// Решение 2 ================================================ //

const processSequence = async ({ value, writeLog, handleSuccess, handleError }) => {

    // 1. Берем строку N. Пишем изначальную строку в writeLog
    writeLog(value);

    // 2. Строка валидируется по правилам
    const checkCondition = validateCondition(handleError);
    const charsInValue = charsIn(value);
    const isValidValue = allPass(
        [
            checkCondition(() => compose(isNaN, Number)(value), "строка не является числом"),
            checkCondition(() => charsInValue(isMoreThan(9)), "кол-во символов в числе должно быть меньше 10"),
            checkCondition(() => charsInValue(isLessThan(3)), "кол-во символов в числе должно быть больше 2"),
            checkCondition(() => compose(isNegative, Number)(value), "число должно быть положительным"),
            checkCondition(() => compose(not, hasDigitAndPoint)(value), "символы в строке только [0-9] и точка"),
        ]
    );
    if (!isValidValue) return;

    try {
        await asyncComposit(
            // 3. Привести строку к числу, округлить к ближайшему целому с точностью до единицы, записать в writeLog
            Number,
            Math.round,
            writeLog,
            // 4. C помощью API /numbers/base перевести из 10-й системы счисления в двоичную, результат записать в writeLog
            getSuccessResultApi(getBinary, 10),
            getResultApi,
            writeLog,
            // 5. Взять кол-во символов в полученном от API числе записать в writeLog
            getLength,
            writeLog,
            // 6. Возвести в квадрат с getRemainderDivisionпомощью Javascript записать в writeLog
            getSquared,
            writeLog,
            // 7. Взять остаток от деления на 3, записать в writeLog
            getRemainderDivisionOn(3),
            writeLog,
            // 8. C помощью API /animals.tech/id/name получить случайное животное используя полученный остаток в качестве id
            getSuccessResultApi(getAnimal, 10),
            getResultApi,
            // 9. Завершить цепочку вызовом handleSuccess в который в качестве аргумента положить результат полученный на предыдущем шаге
            handleSuccess
        )(value);
        // getSuccessResultApi
    } catch (error) {
        handleError(error.message);
    }

}

export default processSequence;