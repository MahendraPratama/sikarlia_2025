import React from 'react';
import dayjs from "dayjs";
import { Spin, message, Popconfirm } from 'antd';
import {
    getDashboardInfo,
    getPenandatangan,
    REACT_APP_URL_API,
} from "../utils/general-api";
import { generateDocument } from './generator-docx';

export const getDayDiff = (dateA, dateB) => {
  if (!dateA || !dateB) return null;

  const a = dayjs(dateA, "DD-MM-YYYY");
  const b = dayjs(dateB, "DD-MM-YYYY");

  return b.diff(a, "day");  // hasil integer (+/-)
};
export const fileMaster = {
  '50200PL-NonLS':'/kontrak50_200PL.docx',
  '50200NonPL-NonLS':'/kontrak50_200.docx',
  '200up-NonLS':'/kontrak200up.docx',
  '100PL-NonLS':'/kontrak50_200PL.docx',
  '100NonPL-NonLS':'/kontrak50_200.docx',
  '100up-NonLS':'/kontrak200up.docx',

  '50200PL-LS':'/kontrak50_200PL_LS.docx',
  '50200NonPL-LS':'/kontrak50_200_LS.docx',
  '200up-LS':'/kontrak200up_LS.docx',
  '100PL-LS':'/kontrak50_200PL_LS.docx',
  '100NonPL-LS':'/kontrak50_200_LS.docx',
  '100up-LS':'/kontrak200up_LS.docx',
}

export async function setSession (dataSession) {

    localStorage.setItem("user_session", dataSession.userid);
    localStorage.setItem("user_name", dataSession.name);
    localStorage.setItem("user_type", dataSession.user_type);
    localStorage.setItem("id", dataSession.id);
    localStorage.setItem("password", dataSession.password);
    localStorage.setItem("email", dataSession.email);
    var newDate = new Date();
    var yearNow = newDate.getFullYear();
    localStorage.setItem("yearFilter", yearNow);
    
    var years = [];
    var yearStart = 2021;
    do {
        years.push(yearStart);
        yearStart++;
    }while (yearStart <= yearNow);
    var now = newDate.getTime();
    
    localStorage.setItem('setupTime', now);
    localStorage.setItem('years', JSON.stringify(years));
    localStorage.setItem('tanggal_lengkap', getTanggalProfile(newDate));
    localStorage.setItem('isLoading', false);
    await getPenandatangan(yearNow, "Koordinator");
    await getPenandatangan(yearNow, "PPK");
    await getPenandatangan(yearNow, "PPBJ");
    await getDashboardInfo(yearNow, dataSession.userid);
}

const getLocStor = (variable) => {

}

const getTanggalProfile = (date) =>{
    const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    let day = days[date.getDay()];

    const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", 
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    let month = months[date.getMonth()];

    let year = date.getFullYear();
    let tgl = date.getDate();

    let ret = day + ", " + tgl + " " + month + " " + year;
    return ret;
}

export const logout = () => {
    localStorage.clear();
}

export const convertTipeKontrak = (type) => {
    var arrTipe = [
        {tipe:'50200NonPL',name:'Barang & Jasa Lainnya | 50-200', filename:'/kontrak50_200_test.docx'},
        {tipe:'100NonPL',name:'Jasa Konsultasi | 100', filename:'/kontrak50_200_test.docx'},
        {tipe:'50200PL',name:'Barang & Jasa Lainnya | 50-200 PL', filename:'/kontrak50_200PL.docx'},
        {tipe:'100PL',name:'Jasa Konsultasi | 100 PL', filename:'/kontrak50_200PL.docx'},
        {tipe:'200up',name:'Barang & Jasa Lainnya | > 200', filename:'/kontrak200up.docx'},
        {tipe:'100up',name:'Jasa Konsultasi | > 100', filename:'/kontrak200up.docx'},
      ];

    var dtSel = arrTipe.filter(x=>x.tipe==type);

    return dtSel[0];
}

export const commafy = ( num ) => {
    var str = num.toString().split('.');
    if (str[0].length >= 5) {
        str[0] = str[0].replace(/(\d)(?=(\d{3})+$)/g, '$1,');
    }
    if (str[1] && str[1].length >= 5) {
        str[1] = str[1].replace(/(\d{3})/g, '$1 ');
    }
    return str.join('.');
}

export const convertTanggal = (tglString) => {
    var arrTgl = tglString.split('-');
    const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", 
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    let month = months[Number(arrTgl[1])-1];

    return arrTgl[2] + " " + month + " " + arrTgl[0];
}

export const renderLoading = (boolean) => {
    return <Spin tip="Loading" spinning={boolean} size="large" fullscreen></Spin>;
}

export const kontrakPreview = (dataSelected) => {
    var itemToDesc = ["namaPekerjaan", "namaPerusahaan", "npwpPerusahaan", "hrgtotal", "nmr", "penandatangananKontrak", "LSorNon"];
    var descLabel = ["Nama Pekerjaan", "Perusahaan Pemenang", "NPWP", "Nilai Kontrak", "Nomor Kontrak", "Tanggal SPK", "Jenis Pengajuan"];
    
    var ctr = 0;
    var objRet = [];
    descLabel.forEach(x=> {
      var item = {
        key: ctr,
        label: x,
        children: x==="Nilai Kontrak"?"Rp. "+commafy(dataSelected[itemToDesc[ctr]]):dataSelected[itemToDesc[ctr]],
        span: ctr===0?3:2,
      }
      objRet.push(item);
      ctr++;
    });
    return objRet;
}

export const setupTgl = (data) =>{
  data.suratPermintaanPPK = data.suratPermintaanPPK == '0000-00-00'? '1900-01-01':data.suratPermintaanPPK;
  data.pengadaanBarJas = data.pengadaanBarJas == '0000-00-00'? '1900-01-01':data.pengadaanBarJas;
  data.HPS = data.HPS == '0000-00-00'? '1900-01-01':data.HPS;
  data.pengajuanPenawaran = data.pengajuanPenawaran == '0000-00-00'? '1900-01-01':data.pengajuanPenawaran;
  data.penawaranRKS = data.penawaranRKS == '0000-00-00'? '1900-01-01':data.penawaranRKS;
  data.undanganEvaluasi = data.undanganEvaluasi == '0000-00-00'? '1900-01-01':data.undanganEvaluasi;
  data.evaluasi = data.evaluasi == '0000-00-00'? '1900-01-01':data.evaluasi;
  data.penetapanPenyedia = data.penetapanPenyedia == '0000-00-00'? '1900-01-01':data.penetapanPenyedia;
  data.laporanPelaksanaan = data.laporanPelaksanaan == '0000-00-00'? '1900-01-01':data.laporanPelaksanaan;
  data.suratPemesanan = data.suratPemesanan == '0000-00-00'? '1900-01-01':data.suratPemesanan;
  data.penandatangananKontrak = data.penandatangananKontrak == '0000-00-00'? '1900-01-01':data.penandatangananKontrak;
  data.suratKesanggupan = data.suratKesanggupan == '0000-00-00'? '1900-01-01':data.suratKesanggupan;
  data.penyelesaianPekerjaan = data.penyelesaianPekerjaan == '0000-00-00'? '1900-01-01':data.penyelesaianPekerjaan;
  data.pembayaran = data.pembayaran == '0000-00-00'? '1900-01-01':data.pembayaran;
  data.TABELPnw = data.TABELPnw == undefined ? [] : data.TABELPnw;
  
  data.subtotalHPS = data.subtotalHPS == undefined ? [] : data.subtotalHPS;
  data.ppnHPS = data.ppnHPS == undefined ? [] : data.ppnHPS;
  data.hrgtotalHPS = data.hrgtotalHPS == undefined ? [] : data.hrgtotalHPS;

  return data;
}

export async function generateViewerKontrak (dataSelected) {
    var data = dataSelected;
    data.hrgtotal = parseInt(data.hrgtotal||0);

    var cb_mgntFee = data.cb_managementFee;
    data.cb_managementFee = cb_mgntFee=="1"?true:false;

    var sat = ["hari","minggu","bulan"];
    var indexSatPlkPkj = data.indexSatPlkPkj || 0;
    data.satPlkPkj = sat[indexSatPlkPkj];

    var urlIFrame;
    const requestOptions = {
      method: 'POST',
      //headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ unique_id: data.unique_id })
    };

    var objRet = {dataProcessed: data, urlIframe: ""};
    await fetch(REACT_APP_URL_API+'/rest/viewKontrakDetail.php', requestOptions)
        .then(response => response.json())
        .then(respon => {
          var dataAPI = respon;
          if(dataAPI.response_code == 200){
            //console.log("DATA API DATA");
            //console.log(dataAPI.data);
            data.TABEL = dataAPI.data.tabel;
            data.TABELPnw =  dataAPI.data.tabelPnw;
            data.TABELNego =  dataAPI.data.tabelNego;
            data.koordinator = dataAPI.data.tabelPdtKoor[0].nama;
            data.nipkoordinator = dataAPI.data.tabelPdtKoor[0].nip;
            data.PPK = dataAPI.data.tabelPdtPPK[0].nama;
            data.nipPPK = dataAPI.data.tabelPdtPPK[0].nip;
            data.PPBJ = dataAPI.data.tabelPdtPPBJ[0].nama;
            data.nipPPBJ = dataAPI.data.tabelPdtPPBJ[0].nip;

            data.jabatanKoor = dataAPI.data.tabelPdtKoor[0].jabatan;
            data.jabatanPPK = dataAPI.data.tabelPdtPPK[0].jabatan;
            
            data = hitungTotal(data,dataAPI.data);
          }
          else{
            data.TABEL = [];
            data.TABELPnw = [];
            data.TABELNego = [];
            data.subtotal = 0;
            data.ppn = 0;
            data.hrgtotal = 0;
            data.subtotalHPS = 0;
            data.ppnHPS = 0;
            data.hrgtotalHPS = 0;
            data.managementFeeHPS = 0;
            data.managementFee = 0;
          }
          data = setupTgl(data);
          objRet["dataProcessed"] = data;
          //console.log(data);
          //this.setState({dataToGenerate:data});
          //console.log(data.tipeKontrak.concat("-",data.LSorNon));
          generateDocument(data,fileMaster[data.tipeKontrak.concat("-",data.LSorNon)],true);
          urlIFrame = 'https://docs.google.com/viewer?url='+REACT_APP_URL_API+'/rest/previewDocx/'+localStorage.user_session+'.docx&embedded=true'
          objRet.urlIframe = urlIFrame;
        });

    return objRet;
}

function hitungTotal(dataKontrak, dataTabel){
    var subtot = 0;
    //console.log(tableHPS);
    // dataTabel.map((d)=>{
    //   subtot += parseInt(removeComma(d.total));
    // })
    //var subtot = 0;
    //console.log(tableHPS);
    //if(flag=="HPS"){
      dataTabel.tabel.map((d)=>{
        subtot += parseInt(removeComma(d.total));
      })
  
      var preppn = subtot * (0.1);
      var preMgmtFee = subtot * (dataKontrak.managementFeePctg/100);
      var mgmtFee = dataKontrak.isPctgMgmtFee == 1 ? preMgmtFee : parseInt(dataKontrak.mgmtFeeNmnl||0);
      var isMgt = dataKontrak.cb_managementFee==1?true:false;
      var isppn = dataKontrak.isPPN==1?true:false;
      var ppn = isMgt?(subtot+mgmtFee)*0.1:preppn;
      var hrgtotal = subtot + (isppn?ppn:0) + (isMgt?mgmtFee:0);
  
     
      dataKontrak.subtotalHPS = subtot;
      dataKontrak.ppnHPS = ppn;
      dataKontrak.hrgtotalHPS = hrgtotal;
      dataKontrak.managementFeeHPS = mgmtFee;
    //}else{
      var subtotHPS = 0;
      dataTabel.tabelPnw.map((d)=>{
        subtotHPS += parseInt(removeComma(d.total));
      })
  
      var preppn = subtotHPS * (0.1);
      var preMgmtFee = subtotHPS * (dataKontrak.managementFeePctgPnw/100);
      var mgmtFee = dataKontrak.isPctgMgmtFeePnw == 1 ? preMgmtFee : parseInt(dataKontrak.mgmtFeeNmnlPnw||0);
      //var mgmtFee = subtotHPS * (dataKontrak.managementFeePctgPnw/100);
      var isMgt = dataKontrak.cb_managementFeePnw==1?true:false;
      var isppn = dataKontrak.isPPNPnw==1?true:false;
      var ppn = isMgt?(subtotHPS+mgmtFee)*0.1:preppn;
      var hrgtotal = subtotHPS + (isppn?ppn:0) + (isMgt?mgmtFee:0);
  
     
      dataKontrak.subtotal = subtotHPS;
      dataKontrak.ppn = ppn;
      dataKontrak.hrgtotal = hrgtotal;
      dataKontrak.managementFee = mgmtFee;
    //}

    return dataKontrak;
  }
function removeComma(num){
  return num.replace(/,/g, '');
}