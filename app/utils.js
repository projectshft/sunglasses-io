//helps find a given state object(brands, products, users)
const findObject = (objId, state) => {
    const item = state.find(obj => obj.id === objId);
    return !item ? null : item;
};

module.exports = {
    findObject
};