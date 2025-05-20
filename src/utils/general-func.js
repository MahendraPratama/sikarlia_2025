import React from 'react';
import { Button, message, Popconfirm } from 'antd';
import {
    getDashboardInfo,
    getPenandatangan,
} from "../utils/general-api";


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

