import React from 'react';
import { Button, message, Popconfirm } from 'antd';

export const REACT_APP_URL_API="https://www.sikarlia.com/api";

export async function getDashboardInfo (yearInput, username) {
    const ro1 = {
        method: 'POST',
        //headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userid: username, year:yearInput })
      };
      await fetch(REACT_APP_URL_API+'/rest/getDashboardInfo.php', ro1)
          .then(response => response.json())
          .then(respon => {
            var dataAPI = respon;
            
            if(dataAPI.response_code != 200){
              
            }else{
              localStorage.setItem("dataDashboard", JSON.stringify(dataAPI.data));
              //console.log("pdtKoordinator");
              //console.log(dataAPI.data);
  
              //this.setState({ pdtKoordinator : dataAPI});
            }
          });
}

export async function getPenandatangan (yearInput, kategori) {
    const ro1 = {
        method: 'POST',
        //headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: kategori, year:yearInput })
      };
      await fetch(REACT_APP_URL_API+'/rest/lookupPdt.php', ro1)
          .then(response => response.json())
          .then(respon => {
            var dataAPI = respon;
            
            if(dataAPI.response_code != 200){
              
            }else{
              localStorage.setItem("pdt"+kategori, JSON.stringify(dataAPI.data));
            }
          });
}

export async function loadDataKontrak(userid, usertype, search, yearFilter){
    const requestOptions = {
      method: 'POST',
      //headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userid: userid, 
                              usertype: usertype, search: search, 
                              yearFilter: yearFilter })
    };

    var ret = await fetch(REACT_APP_URL_API+'/rest/viewKontrak.php', requestOptions)
        .then(response => response.json())
        .then(respon => {
          var dataAPI = respon;
          
          if(dataAPI.response_code != 200){
            
          }else{
            //this.setState({ data: dataAPI.data, dataRender:dataAPI.data, dataToEdit: dataAPI.data });
            //this.handlePageChange(1);
            dataAPI.data.forEach(element => {
              element["key"] = element.unique_id;
            });
            return dataAPI.data;
          }
        });
    return await ret;
}

export async function deleteDataKontrak (unique_id) {
    const requestOptions = {
        method: 'POST',
        //headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ unique_id: unique_id })
    };
    await fetch(process.env.REACT_APP_URL_API+'/rest/deleteKontrak.php', requestOptions)
    .then(response => response.json())
    .then(respon => {
        var dataAPI = respon;
        if(dataAPI.response_code != 200){
            message.error(dataAPI.message);
        }else{
            message.success('Data Berhasil Dihapus!!');
        }
    });

    return await true;
}