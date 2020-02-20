const axios = require('axios');
const { Dev, checkId } = require('../models/Dev');
const parseStringAsArray = require('../utils/parseStringAsArray');

// index, show, store, update, destroy

module.exports = {

  // Lista todos os registros
  async index(request, response) {
    const devs = await Dev.find();
    return response.json(devs);
  },

  // Mostra os dados de um registro
  async show(request, response) {
    const { _id } = request.body;
    // Verifica se é um id válido para o mongodb
    if(checkId(_id)) {
      const dev = await Dev.findById(_id);
      return response.json(dev);
    } else {
      return response.send("O id fornecido não é válido.");
    }
  },

  // Cadastra e retorna o registro
  async store(request, response) {
    const { github_username, techs, latitude, longitude } = request.body;

    let dev = await Dev.findOne({ github_username });

    if (!dev) {
      const apiResponse = await axios.get(`https://api.github.com/users/${github_username}`);
  
      const { name = login, avatar_url, bio } = apiResponse.data;
  
      const techsArray = parseStringAsArray(techs);
  
      const location = {
        type: 'Point',
        coordinates: [longitude, latitude],
      };
  
      dev = await Dev.create({
        github_username,
        name,
        avatar_url,
        bio,
        techs: techsArray,
        location,
      });
    }

    return response.json(dev);
  },

  // Deleta um registro
  async destroy(request, response) {
    const { _id } = request.body;
    // Verifica se é um id válido para o mongodb
    if(checkId(_id)) {
      Dev.findOneAndDelete({ _id }, function (err) {
        if(err) {
          return response.send(err);
        } else {
          return response.send("Usuário deletado com sucesso.");
        }
      });
    } else {
      return response.send("O id fornecido não é válido.");
    }
  },

  // Atualiza um registro
  async update(request, response) {
    const { _id, techs, latitude, longitude, update_from_github = false } = request.body;
    // Verifica se é um id válido para o mongodb
    if(checkId(_id)) {
      const dev = await Dev.findById(_id);
      if(dev) {
        const techsArray = parseStringAsArray(techs);
        const location = {
          type: 'Point',
          coordinates: [longitude, latitude],
        };
        let dataToUpdate = { techs: techsArray, location };
        
        // Atualiza dados a partir do github, se update_from_github == true
        if (update_from_github == true) {
          const apiResponse = await axios.get(`https://api.github.com/users/${dev.github_username}`);
          const { name = login, avatar_url, bio } = apiResponse.data;
          dataToUpdate = { ...dataToUpdate, name, avatar_url, bio };
        }
        console.log(dataToUpdate)

        Dev.findOneAndUpdate(_id, dataToUpdate)
          .then(function (doc) {
            return response.send(`O Dev ${doc.name} foi atualizado.`);
          })
          .catch(function (err) {
            return response.send(err);
          });

      } else {
        return response.send("O registro não foi encontrado no banco de dados.");
      }
    } else {
      return response.send("O id fornecido não é válido.");
    }
  }
        
}