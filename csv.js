const fs = require('fs')
const Papa = require('papaparse');

// 读取 折扣商品 CSV数据
const GetSCV = (path,filter) => {
    return new Promise((resolve, reject) => {
        fs.readFile(path, 'utf8', (err, data) => {
            if (err) {
                console.error(err);
                reject([])
                return;
            }
            const results = Papa.parse(data, {
                header: true, // 如果第一行是标题行，设置为true
                dynamicTyping: true, // 自动转换数据类型
                skipEmptyLines: true, // 跳过空行
            });

            resolve(results.data)
            // console.log(dataArray); // dataArray 现在是一个包含对象的数组，每个对象对应 CSV 文件的一行
        });
    })
}

// 追加信息到用户表
const SetSCV = (obj)=> {
    // 读取 CSV 文件
    fs.readFile('csv/users.csv', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return;
        }
        // 解析 CSV 数据 (假设 CSV 有标题行)
        const columns = ['email','sex','start']
        const parsedData = Papa.parse(data, { header: true}).data;
        // 添加新数据
        parsedData.push(obj);
        // 生成新的 CSV 文件
        const newCsv = Papa.unparse(parsedData);
        console.log(newCsv)
        fs.writeFile('csv/users.csv', newCsv, (err) => {
            if (err) {
                console.error(err);
            } else {
                console.log('数据已成功追加到 CSV 文件');
            }
        });

    });
}

// 筛选商品数据
const FilterGoods = (data)=>{
    let newData = []
    let dataSex = []
    let dataArr= []
    //筛选选择数据
    data.map(item=>{
        if(item.start){
            newData.push(item)
        }
    })
    // 重组分离数据
    newData.map((item,i)=>{
        let key = dataSex.indexOf(item.sex)
        if(key == -1 ){
            dataSex.push(item.sex)
            dataArr.push({
                sex:item.sex,
                data:[item]
            })
        }else {
            let _sex = dataSex.indexOf(item.sex)
            dataArr[_sex].data.push(item)
        }
    })
    return dataArr
}

// 更具用户订阅生成模版
const FilterUserGoods = async (sex) => {
    let arrPromise = []
    function dataGoods(title, path) {
        return new Promise((resolve, reject) => {
            GetSCV(path).then(res => {
                let dataArr = []
                res.map(item => {
                    if (item.start) {
                        dataArr.push(item)
                    }
                })
                resolve({
                    sex: title,
                    data: dataArr
                })
            })
        })
    }
    sex.map(async item => {
        switch (item) {
            case '1':
                arrPromise.push(dataGoods('男装限时', 'csv/uMailM.csv'))
                break;
            case '2':
                arrPromise.push(dataGoods('女装限时', 'csv/uMailW.csv'))
                break;
            case '3':
                arrPromise.push(dataGoods('童装限时', 'csv/uMailK.csv'))
                break;

        }
    })
    return Promise.all(arrPromise);
}

module.exports = { GetSCV, SetSCV, FilterGoods,FilterUserGoods }
