const request = require('request-promise-native')
const _ = require('lodash')

const options = {
  method: 'GET',
  json: true
}

/**
 * getAllData
 * @desc Get the total data for the requested uri
 */
// const getAllData = async ({ uri, limit}) => {
//   options.uri = uri
//   const responseData = await request(options)
//   const total = responseData.count
//   const pages = Math.ceil(total / limit)
//   let promises = []

//   for (let i = 1; i <= pages; i++) {
//     options.uri = `${uri}?page=${i}`
//     promises.push(request(options))
//   }

//   let data = await Promise.all(promises)

//   data = data.reduce((iterator, val) => {
//     for (var i = 0; i < val.results.length; i++) iterator.push(val.results[i])
//     return iterator
//   }, [])

//   return data
// }

const getAllData = async ({ uri, limit, type}) => {
  options.uri = uri
  const responseData = await request(options)
  const total = responseData.count
  const pages = Math.ceil(total / limit)
  let data = []

  for (let i = 1; i <= pages; i++) {
    options.uri = `${uri}?page=${i}`
    data.push(request(options).then(async data => {
      return data
    }))
  }

  let results = await Promise.all(data)
  results = results.reduce((iterator, val) => {
    for (var i = 0; i < val.results.length; i++) iterator.push(val.results[i])
    return iterator
  }, [])

  return results
}

/**
 * transformResidentLinksToName
 * @desc Transform residents links to the names of residents
 */
// const transformResidentLinksToName = async (arr) => {
//   var results = []
//   for (var dataIndex in arr) {
//     const residents = arr[dataIndex].residents
//     if (residents) {
//       let promises = []
//       for (var residentIndex in residents){
//         options.uri = residents[residentIndex]
//         promises.push(request(options))
//       }
//       let people = await Promise.all(promises)
//       people = people.reduce((iterator, person) => {
//         iterator.push(person.name)
//         return iterator
//       }, [])
//       results.push({ ...arr[dataIndex], residents: people })
//     } else {
//       results.push(arr[dataIndex])
//     }
//   }
//   return results
// }

/**
 * sortData
 * @desc Sort given array based on the given object field
 */
const sortData = (arr, sortField) => {
  const sorted = arr.sort((obj1, obj2) => {
    if (Number(obj1[sortField]) && Number(obj2[sortField])) {
      return Number(obj2[sortField]) - Number(obj1[sortField])
    } else if (obj1[sortField] < obj2[sortField]) {
      return -1
    } else if (obj1[sortField] > obj2[sortField]) {
      return 1
    }
    return 0
  })
  return sorted
}

const people = async (req, res) => {
  try {
    const uri = 'https://swapi.co/api/people'
    const allData = await getAllData({ uri, limit: 10 })
    let results = allData
    if (req.query.sortBy) {
        const sortField = req.query.sortBy
        results = sortData(allData, sortField)
    }
    return res.status(200).json(results)
  } catch (err) {
    return res.status(500).json({
      message: 'An error occured while processing your request',
      err
    })
  }
}

const planets = async (req, res) => {
  try {
    const uri = 'https://swapi.co/api/planets'
    const allPlanets = await getAllData({ uri, limit: 10 })
    const people = await getAllData({ uri: 'https://swapi.co/api/people', limit: 10})
    // let results = await transformResidentLinksToName(allData)
    const results = allPlanets.map(planet => {
      planet.residents = planet.residents.map(resident => {
        const index = _.findIndex(people, { url: resident })
        return people[index].name
      })
      return planet
    })
    return res.status(200).json(results)
  } catch (err) {
    console.log(err, 'err')
    return res.status(500).json({
      message: 'An error occured while processing your request',
      err
    })
  }
}

const routes = (router) => {
  router
    .route('/people')
    .get(people)
  router
    .route('/planets')
    .get(planets)
}

module.exports = routes