import React from 'react';
import { Button, message, Popconfirm } from 'antd';

export const REACT_APP_URL_API="https://www.sikarlia.com/api";

export async function getDataPerusahaan() {
  const requestOptions = {
      method: 'POST',
      //headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ namaPerusahaan:"" })
    };

    var ret = await fetch(REACT_APP_URL_API+'/rest/lookupDataPerusahaan.php', requestOptions)
        .then(response => response.json())
        .then(respon => {
          var dataAPI = respon;
          
          if(dataAPI.response_code != 200){
            
          }else{
            //this.setState({ data: dataAPI.data, dataRender:dataAPI.data, dataToEdit: dataAPI.data });
            //this.handlePageChange(1);
            dataAPI.data.forEach(element => {
              element["key"] = element.id;
            });
            return dataAPI.data;
          }
        });
    return await ret;
}
export async function checkUsernameAvailable(username) {
  const currentUsername = localStorage.getItem("user_session"); // username lama

  const requestOptions = {
    method: "POST",
    body: JSON.stringify({
      username: username,
      current_userid: currentUsername
    })
  };

  const ret = await fetch(
    REACT_APP_URL_API + "/rest/cekUserID.php",
    requestOptions
  )
    .then(res => res.json())
    .then(respon => {
      if (respon.response_code !== 200) {
        return { exists: false, error: true };
      }

      return {
        exists: respon.data.exists,
        error: false
      };
    })
    .catch(err => {
      console.error(err);
      return { exists: false, error: true };
    });

  return await ret;
}
export async function updateUserProfile(payload) {
  const requestOptions = {
    method: "POST",
    body: JSON.stringify(payload)
  };

  const ret = await fetch(
    REACT_APP_URL_API + "/rest/updateUserProfile.php",
    requestOptions
  )
    .then(res => res.json())
    .then(respon => {
      if (respon.response_code !== 200) {
        return {
          success: false,
          message: respon.message
        };
      }

      return {
        success: true,
        message: respon.message,
        data: respon.data
      };
    })
    .catch(err => {
      console.error("API ERROR updateUserProfile:", err);
      return {
        success: false,
        message: "Server error"
      };
    });

  return await ret;
}



export async function getAvatars() {
  const requestOptions = {
    method: "POST",
    // headers: { "Content-Type": "application/json" }
  };

  const ret = await fetch(
    REACT_APP_URL_API + "/rest/getAvatars.php",
    requestOptions
  )
    .then(response => response.json())
    .then(respon => {
      const dataAPI = respon;

      if (dataAPI.response_code !== 200) {
        return [];
      } else {
        return dataAPI.data;
      }
    })
    .catch(err => {
      console.error("API ERROR getUsersAvatar:", err);
      return [];
    });

  return await ret;
}
export async function getDashboardInfo (yearInput, username) {
    const ro1 = {
        method: 'POST',
        //headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userid: username, year:yearInput })
      };
      var dataLama = '/rest/getDashboardInfo.php';
      var dataBaru = '/rest/getDashboardBaru.php';

      var alamatAPI = parseInt(yearInput) < 2025 ? dataLama : dataBaru;
      await fetch(REACT_APP_URL_API+alamatAPI, ro1)
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

    var dataLama = '/rest/viewKontrak.php';
    var dataBaru = '/rest/viewDataKontrakBaru.php';

    var alamatAPI = parseInt(yearFilter) < 2025 ? dataLama : dataBaru;

    var ret = await fetch(REACT_APP_URL_API+alamatAPI, requestOptions)
        .then(response => response.json())
        .then(respon => {
          var dataAPI = respon;
          
          if(dataAPI.response_code != 200){
            
          }else{
            dataAPI.data.forEach(element => {
              element["key"] = element.id;
            });
            return dataAPI.data;
          }
        });
    return await ret;
}

export async function getDetailKontrakBaru(idKontrak) {
  const requestOptions = {
    method: "POST",
    // headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: idKontrak
    })
  };

  const ret = await fetch(
    REACT_APP_URL_API + "/rest/viewDataKontrakDetailBaru.php",
    requestOptions
  )
    .then(response => response.json())
    .then(respon => {
      const dataAPI = respon;

      if (dataAPI.response_code !== 200) {
        return null;
      } else {
        return dataAPI.data;
      }
    })
    .catch(err => {
      console.error("API ERROR getDetailKontrakBaru:", err);
      return null;
    });

  return await ret;
}

export async function deleteDataKontrak (unique_id, tipe = "Old") {
    const requestOptions = {
        method: 'POST',
        //headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ unique_id: unique_id })
    };
    var dataLama = '/rest/deleteKontrak.php';
    var dataBaru = '/rest/deleteKontrakBaru.php';

    var alamatAPI = tipe === "Old" ? dataLama : dataBaru;

    await fetch(process.env.REACT_APP_URL_API+alamatAPI, requestOptions)
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

export async function modifyDataPerusahaan(userid, dataPerusahaan){
    const requestOptions = {
      method: 'POST',
      //headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userid: userid, 
        nama_perusahaan: dataPerusahaan.perusahaan_pemenang,
        alamat_perusahaan: dataPerusahaan.alamat_perusahaan,
        npwp: dataPerusahaan.npwp,
        nama_direktur: dataPerusahaan.nm_dir_perusahaan_pemenang,
        nik_direktur: dataPerusahaan.nik_dir,
        jabatan: dataPerusahaan.jbt_perusahaan_pemenang,
        bank: dataPerusahaan.bank,
        cabang: dataPerusahaan.cabang,
        nama_rekening: dataPerusahaan.atas_nama_bank,
        nomor_rekening: dataPerusahaan.norek,
        id: dataPerusahaan.id_perusahaan_pemenang,
      })
    };

    var ret = await fetch(REACT_APP_URL_API+'/rest/insertDataPerusahaanBaru.php', requestOptions)
        .then(response => response.json())
        .then(respon => {
          var dataAPI = respon;
          
          if(dataAPI.response_code != 200){
            
          }else{
            //this.setState({ data: dataAPI.data, dataRender:dataAPI.data, dataToEdit: dataAPI.data });
            //this.handlePageChange(1);
            // dataAPI.data.forEach(element => {
            //   element["key"] = element.unique_id;
            // });
            return dataAPI.data;
          }
        });
    return await ret;
}

export async function modifyDataKontrak(userid, dataKontrak) {
  const requestOptions = {
    method: 'POST',
    // headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userid: userid,

      // ===== BASIC =====
      id: dataKontrak.id, // kalau ada → UPDATE, kalau null → INSERT
      nama_pekerjaan: dataKontrak.nama_pekerjaan,
      nomor_kontrak: dataKontrak.no_kontrak,
      angka_pelaksanaan:dataKontrak.angka_pelaksanaan,

      nilai_hps: dataKontrak.harga_hps,
      nilai_spk: dataKontrak.harga_penawaran,
      nilai_pembanding: dataKontrak.harga_penawaran_pmb,

      // ===== TANGGAL =====
      tanggal_nodin_ppk: dataKontrak.tgl_nodin_ppk,
      tanggal_hps: dataKontrak.tgl_hps,
      tanggal_undangan_ppbj: dataKontrak.tgl_und_ppbj,
      tanggal_dokumen_penawaran: dataKontrak.tgl_dok_pnw,

      tanggal_bapp: dataKontrak.tgl_bapp,
      tanggal_baep: dataKontrak.tgl_baep,
      tanggal_bakh: dataKontrak.tgl_bakh,
      tanggal_bahp: dataKontrak.tgl_bahp,
      tanggal_pphp: dataKontrak.tgl_pphp,

      tanggal_nodin_ppbj: dataKontrak.tgl_nodin_ppbj,
      tanggal_sppbj: dataKontrak.tgl_sppbj,
      tanggal_persiapan: dataKontrak.tgl_persiapan,
      tanggal_spk: dataKontrak.tgl_spk,

      tanggal_bapb: dataKontrak.tgl_bapb,
      tanggal_bast: dataKontrak.tgl_bast,
      tanggal_bap: dataKontrak.tgl_bap,

      // ===== RELASI =====
      id_perusahaan_pemenang: dataKontrak.id_perusahaan_pemenang
    })
  };

  const ret = await fetch(
    REACT_APP_URL_API + '/rest/insertDataKontrakBaru.php',
    requestOptions
  )
    .then(response => response.json())
    .then(respon => {
      if (respon.response_code !== 200) {
        throw new Error(respon.message || 'API Error');
      }
      return respon.data;
    });

  return ret;
  
}