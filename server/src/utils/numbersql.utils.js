const { Sequelize, Op } = require("sequelize")

const numberQuerySql = ({ col, num }) => {
    const arr = []
    const nums = num.split(',')
    nums.forEach(n => {
        const _nArr = n.split('_')
        if (_nArr.length === 1) {
            arr.push(Sequelize.where(col, { [Op.eq]: _nArr[0] }))
        } else if (!_nArr[0]) {
            arr.push(Sequelize.where(col, { [Op.lte]: _nArr[1] }))
        } else if (!_nArr[1]) {
            arr.push(Sequelize.where(col, { [Op.gte]: _nArr[0] }))
        } else {
            arr.push(Sequelize.where(col, { [Op.between]: [_nArr[0], _nArr[1]] }))
        }
    })

    return {
        [Op.or]: arr
    }
}

module.exports = numberQuerySql