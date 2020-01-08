import Vuex from 'vuex'
import Vue from 'vue'
import axios from 'axios';

Vue.use(Vuex)

/*var axios_options = {
  proxy: {
    host: "127.0.0.1",
    port: 3000
  }
};*/


export default new Vuex.Store({
  state: {
    projectDir: "None", // The TV inventory
    projects: [],
    images: [],
    isProjectOpen: false,
    sCmdVel: null,
  },

  getters: {
    // Here we will create a getter
    getProjectDir: state => {
      return state.projectDir
    },
    getProjects: state => state.projects,
    getImages: state => state.images,
    getProjectStatus: state => state.isProjectOpen,
    getCmdVel: state => state.sCmdVel
  },

  mutations: {
    // Here we will create Jenny
    setProjectDir(state, proDir) {
      // For now we allow Jenny just to remove 
      // one TV at a time.
      //state.totalTvCount--
      state.projectDir = proDir
    },
    addPeojects(state, projects) {
      state.projects = projects
    },
    addImages(state, images){
      state.images = images
    },
    setCmdVel(state, cmd){
      state.sCmdVel = cmd
    }
  },

  actions: {
    // Here we will create Larry
    setProjectDir(context, proDir) {
      axios.post('createProject', {
          projectDir: proDir
        })
        .then((response) => {
          console.log(response.data);
          if (response.data.status === 'OK') {
            console.log("File is OK!!!!");
            context.commit('setProjectDir', proDir)
          }
        })
        .catch((error) => {
          console.log(error);
        });
    },
    changeProjectDir(context, proDir) {

      context.commit('setProjectDir', proDir)

    },
    uploadImage({
      state, dispatch
    }, imgData) {

      axios.post('/upload/image', {
          path: state.projectDir,
          base64image: imgData
        })
        .then((response) => {
          console.log(response.data);
          if (response.data.status === 'OK') {
            console.log("File is OK!!!!");

            //this.$refs['saveAnotation'].show()
            dispatch('reqImages');
            //return true;
          }
        })
        .catch((error) => {
          console.log(error);
          //return false;
        });
    },
    regProjects(context) {
      axios.get('/getProjects')
        .then((response) => {
          console.log(response.data);
          if (response.data.status === 'OK') {
            console.log("File is OK!!!!");
            context.commit('addPeojects', response.data.projects)
            context.state.isProjectOpen = true;

            //this.$refs['saveAnotation'].show()
            
            //return true;
          }
        })
        .catch((error) => {
          console.log(error);
          //return false;
        });
    },
    reqImages({state, commit}) {
      let uri = 'getFiles';
      console.log(state.projectDir)
      axios.post(uri, {
        path: state.projectDir
      }).then((response) => {
        var info = response.data.files;
        var index, len;
        var allImgs = []
        for (index = 0, len = info.length; index < len; ++index) {
          var imPath = response.data.projectDir + response.data.folder + "/" + info[index].file;
          allImgs.push({
            fileName: info[index].file,
            file: imPath,
            id: info[index].id
          })
        }
        console.log(response.data.files)
        commit('addImages', allImgs)

        
      });
    },
    setCmdVel({state}, cmd){
      state.sCmdVel = cmd
    },

    deleteProject({state, commit}, sel_projectDir) {
      let uri = 'deleteProject';
      console.log(sel_projectDir)
      axios.post(uri, {
        path: sel_projectDir
      }).then((response) => {
        console.log(response.data)
        console.log(sel_projectDir)
        console.log(state.projectDir)
        if(sel_projectDir === state.projectDir){
          commit('setProjectDir', "null")
        }
      });
    }




  }
});