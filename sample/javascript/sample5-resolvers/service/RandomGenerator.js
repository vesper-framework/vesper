class RandomGenerator {

    generate() {
        return Math.floor((Math.random() * 100) + 1);
    }

}

module.exports = {
    RandomGenerator: RandomGenerator
};