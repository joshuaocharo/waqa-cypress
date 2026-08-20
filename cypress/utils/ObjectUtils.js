/*
Delete nested keys from an object in-place. Keys support dot-notation for
nested props, and arrays: 'daily.date' deletes `date` from every element of
`daily`.
*/
module.exports.deleteNestedKeys = (obj, keys) => {
    keys.forEach((keyPath) => {
        if (keyPath.includes('.')) {
            const tempKeys = keyPath.split('.');
            const aKey = tempKeys.slice(-1)[0];
            tempKeys.splice(-1);
            const tempIsArrayProp = `obj['${tempKeys.join('.').replaceAll('.', "']['")}']`;

            if (!eval(`Array.isArray(${tempIsArrayProp})`)) {
                const tempProp = `obj['${keyPath.replaceAll('.', "']['")}']`;
                eval(`delete ${tempProp}`);
            } else {
                eval(`${tempIsArrayProp}`).forEach((item) => {
                    delete item[aKey];
                });
            }
        } else {
            delete obj[keyPath];
        }
    });

    return obj;
};

const sortObjectKeys = (obj) => {
    if (typeof obj !== 'object' || obj === null) {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(sortObjectKeys);
    }

    const sortedKeys = Object.keys(obj).sort((a, b) => {
        if (a === null) return -1;
        if (b === null) return 1;
        return a.localeCompare(b);
    });

    const sortedObj = {};
    for (const key of sortedKeys) {
        sortedObj[key] = sortObjectKeys(obj[key]);
    }

    return sortedObj;
};

module.exports.sortKeys = (obj) => sortObjectKeys(obj);