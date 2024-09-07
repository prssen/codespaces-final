// import axios from 'axios';
import currencySymbol from "currency-symbol";

// const axiosInstance = axios.create({
//   baseURL: 'http://your-api-url.com',
//   headers: {
//     'Content-Type': 'application/json',
//     'X-CSRFToken': getCookie('csrftoken'),
//   },
// });

// export default axiosInstance;

// const parser = new DOMParser();
import { decode } from 'html-entities';

// Convert item into a 1-dimensional array
export const arr = (value) => [value].flat(Infinity);

// Credit: code from https://dev.to/ypdev19/ways-to-title-case-strings-with-javascript-1dpe
export const toTitleCase = (str) => {
    if (!str) {
        return "";
    }
    return str.toLowerCase().replace(/\b\w/g, (s) => s.toUpperCase());
};

// Recursively check if object is empty (has
// no enumerable properties). From GitHub copilot response
export const isEmpty = (obj) => {
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            let value = obj[key];
            if (value && typeof value === "object") {
                if (!isEmpty(value)) {
                    return false;
                }
            } else if (value !== null && value !== undefined && value !== "") {
                return false;
            }
        }
        // if (typeof obj[key] === "object" && !isEmpty(obj[key])) {
        //     // return isEmpty(obj[key]);
        // }
    }
    return true;
};

    // Given a currency code, convert into an escaped character sequence, and use
    // DOM parser to convert into Unicode symbol
export const symb = (currencyCode) => {
        if (currencyCode) {
            const escapedCharacter = currencySymbol.symbol(currencyCode);
            // const symbol = parser.parseFromString(escapedCharacter,'text/html').body.textContent;
            const symbol = decode(escapedCharacter);

            // Using node-parser
            // const symbol = parser.parse('&#200;', 'text/html').childNodes[0]._rawText
            return symbol;
        }
    }

// Remove any key-value pairs in object where value is nullish
// Adapted from https://stackoverflow.com/a/57625661
export const removeEmpties = (obj) => {
    // Check if argument is an object first
    if (typeof obj === 'object' && !Array.isArray(obj) && obj !== null) {
        return Object.entries(obj).reduce((a,[k,v]) => (v ? (a[k]=v, a) : a), {});
    }
    return obj;
}

/**
 *  Returns currency amount as a string with thousands separator, and 2 decimal places
    if a decimal amount, or 0 decimal places if a whole number (e.g. £35)
 */
export const formatCurrency = (number, currency='GBP') => {
    const formatter = Intl.NumberFormat("en-GB", {
        style: "decimal",
        currency: currency,
        maximumFractionDigits: 2,
        minimumFractionDigits: Number.isInteger(parseFloat(number)) ? 0 : 2
    });

    return formatter.format(number);
};

// Method to insert an item into array at a given index,
// filling the array with undefined values up to the index if it is greater
// than the array's current length

// TODO: fix - .fill() doesn't add undefined beyond the array's current length
const insertIntoArray = (arr, value, index) => {
    if (index < arr.length) {
        return arr.toSpliced(index, 0, value)
    } else {
        arr.fill(undefined, arr.length, index);
        arr.toSpliced(index, 0, value)
    }
    return arr;
}


/**
 * Convert hexadecimal strings to ASCII, removing null characters - 
 * adapted from https://stackoverflow.com/a/71499182 and https://stackoverflow.com/a/57761083 
 *  */ 
export const hexToAscii = (hexString) => {
    return hexString
            .match(/.{1,2}/g)
            .map(code => String.fromCharCode(parseInt(code, 16)))
            .filter(char => char.codePointAt(0))
            .join('');
}

/**
 * Insert spaces between words in a camel case string. Adapted from: https://stackoverflow.com/a/7888303
 */
export const splitCamelCase = str => str.match(/([A-Z]?[^A-Z]*)/g).slice(0,-1);

/**
 * Difference between a given datestring and today, given in
 * integer days
 * 
 * @param {String} date a datestring in a format JS's Date() object can parse, e.g. 07-01-2010
 */
export const dateDiff = (date) => {
    const milliseconds = new Date() - new Date(date)
    const days = milliseconds / (1000 * 60 * 60 * 24);
    return Math.round(days);
}

/**
 * Sum the values of a given property in every object in an array of 
 * objects.
 * 
 * @param{object} obj - Object to sum over
 * @param{string} property - property name to select in each object
 */
export const objectSum = (obj, property) => {
    return obj?.reduce((acc, curr) => acc += parseFloat(curr[property]), 0);
}

/**
 * Calculate average of all values of a property in an array of objects
 * 
 * @param {object} obj 
 * @param {string} property 
 * @returns {integer} average property value
 */
export const objectMean = (obj, property) => {
    return objectSum(obj, property) / obj?.length;
}

// Get maximum value of an array
// Credit: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/max#getting_the_maximum_element_of_an_array
export const maxArray = (arr) => arr.reduce((a, b) => Math.max(a, b), -Infinity);

// Get minimum value of an array
export const minArray = (arr) => arr.reduce((a, b) => Math.min(a, b), Infinity);

// Convert birthdate to age
// Adapted from https://stackoverflow.com/a/50827764
export const getAge = (birthDate) => {
    // Null values give a date of 1/1/1970, so convert them to undefined instead
    const safeDate = birthDate === null ? undefined : birthDate;
    return Math.floor((new Date() - new Date(safeDate).getTime()) / 3.15576e10);
}

export const getBreadcrumbs = pathname => {
    const pathList = pathname.split('/').filter(Boolean);
    const breadcrumbs = pathList.map((path, index) => {
        if (path === 'accounting') {
            return {
                label: 'Home',
                url: '/accounting'
            }
        }
        else {
            return {
                // label: path.charAt(0).toUpperCase() + path.substring(1),
                label: toTitleCase(path),
                // If route ends with 'list', parent crumb should redirect to 
                // the same list view
                url: pathList[pathList.length - 1] === 'list' ? pathname : '/' + pathList.slice(0, index + 1).join('/')
            }
        }
    })
    return breadcrumbs;
}
