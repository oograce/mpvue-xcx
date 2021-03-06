import http from '../../http/http.js'
import util from '../../common/util'
/**
 * 通用数据仓库
 * @author siye
 *  */
export default {
  getters: {
    // 根据值列表类型获取值列表数据
    getLov: (state) => (type) => {
      for(let i=0;i<state.lov.length;i++) {
        let temp = state.lov[i];
        if(type === temp.type) {
          return temp;
        }
      }
      return [];
    },
    // 获取缓存至本地的row_id数据，用于新建对象
    getId: (state) => () => {
      if (state.rowIds.length >= 10) {
        return state.rowIds.pop();
      } else {
        let id = state.rowIds.pop();
        if (state.rowIds.length < 5) {
          this.a.mutations.downloadMoreId(state);
        }
        return id;
      }
    }
  },
  mutations: {
    // set toast params
    setToastParam (state, res) {
      state.hasToast = res;
    },
    // download lov data
    loadLov (state) {
      let lov = wx.getStorageSync('lov');
      if(util.isEmpty(lov)) {
        http.get('/base/staticvalue/queryAll', {
        }).then((res) => {
          if(res.data.success) {
            let lov = [];
            for(let i = 0;i < res.data.result.length; i++) {
              let temp = res.data.result[i];
              let findFlag = false;
              for (let j = 0; j < lov.length; j++) {
                if (lov[j].type === temp.type) {
                  findFlag = true;
                }
              }
              if(!findFlag) {
                let lovItem = {
                  type: temp.type,
                  value: []
                };
                lov.push(lovItem);
              }
            }
            for(let i = 0;i < res.data.result.length; i++) {
              let temp = res.data.result[i];
              for (let j = 0; j < lov.length; j++) {
                if (lov[j].type === temp.type) {
                  lov[j].value.push(temp);
                }
              }
            }
            wx.setStorage({
              key: "lov",
              data: JSON.stringify(lov)
            });
            state.lov = lov;
          } else {
            console.log("获取值列表失败=> " + res.data.message);
          }
        }).catch((error) => {
          console.log("获取值列表失败=> " + error);
        });
      } else {
        state.lov = JSON.parse(lov);
      }
    },
    // download more row_id
    downloadMoreId (state)  {
      state.hasToast = false;      // 不需要遮罩
      http.post('/mobile/image/getId', {
      }).then((res) => {
        state.hasToast = true;
        if (res.data.success) {
          if (res.data.result != null) {
            for (let i = 0; i < res.data.result.length; i++) {
              state.rowIds.unshift(res.data.result[i]);
            }
          }
        } else {
          console.log("获取Row_Id失败=> " + res.data.message);
        }
      }).catch((error) => {
        state.hasToast = true;
        console.log("获取Row_Id失败=> " + error);
      });
    }
  },
  state: {
    lov: [],        // 值列表
    hasToast: true, // 控制是有使用遮罩
    rowIds: []
  }
}
