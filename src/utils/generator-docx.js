import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import PizZipUtils from 'pizzip/utils/index.js';
import React from 'react';
import { saveAs } from 'file-saver';
import { set } from 'react-ga';
import angkaTerbilang from '@develoka/angka-terbilang-js';
import Base64String from 'lz-string';
//import DocViewer from "react-doc-viewer";
import ImageModule from 'docxtemplater-image-module-free';
import InspectModule from 'docxtemplater/js/inspect-module';
import { commafy } from './general-func';
import { REACT_APP_URL_API } from './general-api';

import template_lama from "../docx_template/kontrak50_200.docx";
import template_BPSDM from "../docx_template/TEMPLATE_KONTRAK_BPSDM.docx";

//import ImageModule from 'open-docxtemplater-image-module';
//var ImageModule=require('docxtemplater-image-module');
//var ImageModule=require('docxtemplater-image-module');
function loadFile(url, callback) {
    PizZipUtils.getBinaryContent(url, callback);
}

const fixDocPrCorruptionModule = {
  set(options) {
      if (options.Lexer) {
          this.Lexer = options.Lexer;
      }
      if (options.zip) {
          this.zip = options.zip;
      }
  },
  on(event) {
      if (event.name === "attached") {
          this.attached = false;
      }
      if (event !== "syncing-zip") {
          return;
      }
      const zip = this.zip;
      const Lexer = this.Lexer;
      let prId = 1;
      function setSingleAttribute(partValue, attr, attrValue) {
          const regex = new RegExp(`(<.* ${attr}=")([^"]+)(".*)$`);
          if (regex.test(partValue)) {
              return partValue.replace(regex, `$1${attrValue}$3`);
          }
          let end = partValue.lastIndexOf("/>");
          if (end === -1) {
              end = partValue.lastIndexOf(">");
          }
          return (
              partValue.substr(0, end) +
              ` ${attr}="${attrValue}"` +
              partValue.substr(end)
          );
      }
      zip.file(/\.xml$/).forEach(function (f) {
          let text = f.asText();
          const xmllexed = Lexer.xmlparse(text, {
              text: [],
              other: ["wp:docPr"],
          });
          if (xmllexed.length > 1) {
              text = xmllexed.reduce(function (fullText, part) {
                  if (
                      part.tag === "wp:docPr" &&
                      ["start", "selfclosing"].indexOf(part.position) !== -1
                  ) {
                      return (
                          fullText +
                          setSingleAttribute(part.value, "id", prId++)
                      );
                  }
                  return fullText + part.value;
              }, "");
          }
          zip.file(f.name, text);
      });
  },
};
export async function generateDocument2025(dataKontrak, isPreview = false) {
  //#### PAKE INI UNTUK DI DEPLOY KE SERVER
  const path = window.location.origin + '/TEMPLATE_KONTRAK_BPSDM.docx'; //+ '/testTemplate.docx'

  //#### PAKE INI UNTUK TESTING DI LOKAL
  //const path = template_BPSDM;
  loadFile(path, function(
      error,
      content
    ) {
      if (error) {
        throw error;
      }
      //var ImageModule = require("open-docxtemplater-image-module");
      var opts = {};
      opts.centered = true;
      opts.getImage = function (tagValue, tagName) {
        const base64Regex = /^data:image\/(png|jpg|svg|svg\+xml);base64,/;
        if (!base64Regex.test(tagValue)) {
          return false;
        }
        const stringBase64 = tagValue.replace(base64Regex, "");
        let binaryString;
        if (typeof window !== "undefined") {
          binaryString = window.atob(stringBase64);
        } else {
          binaryString = Buffer.from(stringBase64, "base64").toString(
            "binary"
          );
        }
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          const ascii = binaryString.charCodeAt(i);
          bytes[i] = ascii;
        }
        return bytes.buffer;
      };
      opts.getSize = function (img, tagValue, tagName) {
        var width = dataKontrak.HPSimgW;
        var height = dataKontrak.HPSimgH;
        const forceWidth = 620;
        const ratio = forceWidth / width;
        return [
          forceWidth,
          // calculate height taking into account aspect ratio
          Math.round(height * ratio),
        ];
      };
      

      var imageModule = new ImageModule(opts);

      const zip = new PizZip(content);
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
        nullGetter: nullGetter,
        //modules: [imageModule, fixDocPrCorruptionModule],
      }).compile();
      doc.setData(setupData(dataKontrak));
      //console.log(hps2);
      try {
        // render the document (replace all occurences of {first_name} by John, {last_name} by Doe, ...)
        doc.render();
        //console.log(dataKontrak);
      } catch (error) {
        // The error thrown here contains additional information when logged with JSON.stringify (it contains a properties object containing all suberrors).
        function replaceErrors(key, value) {
          if (value instanceof Error) {
            return Object.getOwnPropertyNames(value).reduce(function(
              error,
              key
            ) {
              error[key] = value[key];
              return error;
            },
            {});
          }
          return value;
        }

        if (error.properties && error.properties.errors instanceof Array) {
          const errorMessages = error.properties.errors
            .map(function(error) {
              return error.properties.explanation;
            })
            .join('\n');
        }
        throw error;
      }
      const out = doc.getZip().generate({
        type: 'blob',
        mimeType:
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      }); //Output the document using Data-URI
      if(isPreview){
        var reader = new FileReader();
        const pvw = doc.getZip().generate({
          type: "arraybuffer",
          compression: "DEFLATE",
          //mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        })
        var blob = new Blob([pvw], {
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        });
        //saveAs(blob)
        try{
          reader.readAsDataURL(blob);
          reader.onloadend = function() {
            var base64data = reader.result;
            fetch(REACT_APP_URL_API+'/rest/uploadFileViewer.php', {
              method: 'POST',
              body: JSON.stringify({ base64: base64data, userid: dataKontrak.userid})
            }).then((response) => {
              //console.log(response)
              //var src = "https://view.officeapps.live.com/op/embed.aspx?src="+"https://sikarliaapi.000webhostapp.com/rest/asu.docx";//+"&embedded=true";
              //var src = "https://docs.google.com/viewerng/viewer?url="+"https://sikarliaapi.000webhostapp.com/rest/asu.docx"+"&embedded=true";
              var src = 'https://docs.google.com/viewer?url='+REACT_APP_URL_API+'/rest/previewDocx/'+dataKontrak.userid+'.docx&embedded=true';
              try{
                document.getElementById("viewer").src = src;

              }catch(e){
                
              }
              //return src;
            })
          };
        }
        catch(e){
          console.log(e);
        }
        return;
      }
      saveAs(out, dataKontrak.nama_pekerjaan+'_output.docx');
    });
}

function setupData(dataKontrak){
  return {
    no_kontrak: dataKontrak.no_kontrak,
    nama_pekerjaan: dataKontrak.nama_pekerjaan,
    nama_pekerjaan_upper: dataKontrak.nama_pekerjaan.toUpperCase(),
    harga_hps: commafy(dataKontrak.harga_hps),
    harga_hps_terbilang: angkaTerbilang(dataKontrak.harga_hps),
    harga_penawaran: commafy(dataKontrak.harga_penawaran),
    harga_penawaran_terbilang: angkaTerbilang(dataKontrak.harga_penawaran),
    harga_penawaran_pmb: commafy(dataKontrak.harga_penawaran_pmb),
    harga_penawaran_pmb_terbilang: angkaTerbilang(dataKontrak.harga_penawaran_pmb),
    angka_pelaksanaan: dataKontrak.angka_pelaksanaan,
    pelaksanaan_terbilang: angkaTerbilang(dataKontrak.angka_pelaksanaan),
    
    perusahaan_pemenang: dataKontrak.perusahaan_pemenang,
    npwp: dataKontrak.npwp,
    alamat_perusahaan: dataKontrak.alamat_perusahaan,
    nm_dir_perusahaan_pemenang: dataKontrak.nm_dir_perusahaan_pemenang,
    nik_dir: dataKontrak.nik_dir,
    jbt_perusahaan_pemenang: dataKontrak.jbt_perusahaan_pemenang,
    bank: dataKontrak.bank,
    cabang: dataKontrak.cabang,
    norek: dataKontrak.norek,
    atas_nama_bank: dataKontrak.atas_nama_bank,
    perusahaan_pembanding: "(diisi nama Perusahaan Pembanding)",

    tgl_nodin_ppk: setupTanggal(dataKontrak.tgl_nodin_ppk, "tgl_lengkap"),
    bln_nodin_ppk: dataKontrak.tgl_nodin_ppk.$M,

    tgl_hps: setupTanggal(dataKontrak.tgl_hps, "tgl_lengkap"),
    tgl_und_ppbj: setupTanggal(dataKontrak.tgl_und_ppbj, "tgl_lengkap"),
    bln_und_ppbj: dataKontrak.tgl_und_ppbj.$M,

    tgl_dok_pnw: setupTanggal(dataKontrak.tgl_dok_pnw, "tgl_lengkap"),
    hari_dok_pnw: setupTanggal(dataKontrak.tgl_dok_pnw, "hari"),

    tgl_bapp: setupTanggal(dataKontrak.tgl_bapp, "tgl_lengkap"),
    hari_bapp: setupTanggal(dataKontrak.tgl_bapp, "hari"),
    bln_bapp: dataKontrak.tgl_bapp.$M,
    tgl_bapp_terbilang: setupTanggal(dataKontrak.tgl_bapp, "tgl_terbilang"),
    bln_bapp_terbilang: setupTanggal(dataKontrak.tgl_bapp, "bulan_terbilang"),
    thn_bapp_terbilang: setupTanggal(dataKontrak.tgl_bapp, "tahun_terbilang"),

    tgl_baep: setupTanggal(dataKontrak.tgl_baep, "tgl_lengkap"),
    bln_baep: dataKontrak.tgl_baep.$M,
    hari_baep: setupTanggal(dataKontrak.tgl_baep, "hari"),
    tgl_baep_terbilang: setupTanggal(dataKontrak.tgl_baep, "tgl_terbilang"),
    bln_baep_terbilang: setupTanggal(dataKontrak.tgl_baep, "bulan_terbilang"),
    thn_baep_terbilang: setupTanggal(dataKontrak.tgl_baep, "tahun_terbilang"),

    tgl_bakh: setupTanggal(dataKontrak.tgl_bakh, "tgl_lengkap"),
    bln_bakh: dataKontrak.tgl_bakh.$M,
    hari_bakh: setupTanggal(dataKontrak.tgl_bakh, "hari"),
    tgl_bakh_terbilang: setupTanggal(dataKontrak.tgl_bakh, "tgl_terbilang"),
    bln_bakh_terbilang: setupTanggal(dataKontrak.tgl_bakh, "bulan_terbilang"),
    thn_bakh_terbilang: setupTanggal(dataKontrak.tgl_bakh, "tahun_terbilang"),


    tgl_bahp: setupTanggal(dataKontrak.tgl_bahp, "tgl_lengkap"),
    bln_bahp: dataKontrak.tgl_bahp.$M,
    hari_bahp: setupTanggal(dataKontrak.tgl_bahp, "hari"),
    tgl_bahp_terbilang: setupTanggal(dataKontrak.tgl_bahp, "tgl_terbilang"),
    bln_bahp_terbilang: setupTanggal(dataKontrak.tgl_bahp, "bulan_terbilang"),
    thn_bahp_terbilang: setupTanggal(dataKontrak.tgl_bahp, "tahun_terbilang"),

    tgl_pphp: setupTanggal(dataKontrak.tgl_pphp, "tgl_lengkap"),
    bln_pphp: dataKontrak.tgl_pphp.$M,

    tgl_nodin_ppbj: setupTanggal(dataKontrak.tgl_nodin_ppbj, "tgl_lengkap"),
    bln_nodin_ppbj: dataKontrak.tgl_nodin_ppbj.$M,

    tgl_sppbj: setupTanggal(dataKontrak.tgl_sppbj, "tgl_lengkap"),
    bln_sppbj: dataKontrak.tgl_sppbj.$M,

    hari_spk: setupTanggal(dataKontrak.tgl_spk, "hari"), 
    tgl_spk: setupTanggal(dataKontrak.tgl_spk, "tgl_lengkap"),
    bln_spk: dataKontrak.tgl_spk.$M,

    tgl_bapb: setupTanggal(dataKontrak.tgl_bapb, "tgl_lengkap"),
    bln_bapb: dataKontrak.tgl_bapb.$M,

    tgl_bast: setupTanggal(dataKontrak.tgl_bast, "tgl_lengkap"),
    bln_bast: dataKontrak.tgl_bast.$M,
    hari_bast: setupTanggal(dataKontrak.tgl_bast, "hari"),
    tgl_bast_terbilang: setupTanggal(dataKontrak.tgl_bast, "tgl_terbilang"),
    bln_bast_terbilang: setupTanggal(dataKontrak.tgl_bast, "bulan_terbilang"),
    thn_bast_terbilang: setupTanggal(dataKontrak.tgl_bast, "tahun_terbilang"),

    tgl_bap: setupTanggal(dataKontrak.tgl_bap, "tgl_lengkap"),
    bln_bap: dataKontrak.tgl_bap.$M,
    hari_bap: setupTanggal(dataKontrak.tgl_bap, "hari"),
    tgl_bap_terbilang: setupTanggal(dataKontrak.tgl_bap, "tgl_terbilang"),
    bln_bap_terbilang: setupTanggal(dataKontrak.tgl_bap, "bulan_terbilang"),
    thn_bap_terbilang: setupTanggal(dataKontrak.tgl_bap, "tahun_terbilang"),

    tgl_persiapan: setupTanggal(dataKontrak.tgl_persiapan, "tgl_lengkap"),
    ta: dataKontrak.tgl_spk.$y,
  }
}
function setupTanggal(dateInput,type=null){
  if(dateInput==null){
    return null;
  }
  var arrbulan =["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
  var arrhari = ["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"]
  //var dateString = dateInput.split("-");
  var day = dateInput.$D;
  var month = dateInput.$M;
  var year = dateInput.$y;
  var d = new Date(year,month,day);
  var hari = arrhari[d.getDay()];
  var output = [hari+",", day, arrbulan[month], year].join(" ");
  if(type=="tgl_lengkap"){
    return [day, arrbulan[month], year].join(" ");
  }
  if(type=="hari"){
    return hari.toUpperCase();
  }
  if(type=="tgl_terbilang"){
    return angkaTerbilang(day).toUpperCase();
  }
  if(type=="bulan_terbilang"){
    return arrbulan[month].toUpperCase();
  }
  if(type=="tahun_terbilang"){
    return angkaTerbilang(year).toUpperCase();
  }
  return output;
}


export async function generateDocument (dataKontrak, namaFile, isPreview = false) {
  var hps2 = [
    {judul: "Sub Total", nilai: commafy(dataKontrak.subtotalHPS)},
    {judul: "Grand Total", nilai: commafy(dataKontrak.hrgtotalHPS)},
  ];
  var pnw2 = [
    {judul: "Sub Total", nilai: commafy(dataKontrak.subtotal)},
    {judul: "Grand Total", nilai: commafy(dataKontrak.hrgtotal)},
  ];

    //#### PAKE INI UNTUK DI DEPLOY KE SERVER
    //const path = window.location.origin + namaFile; //+ '/testTemplate.docx'

    //#### PAKE INI UNTUK TESTING DI LOKAL
    const path = template_lama;
      
  if(dataKontrak.cb_managementFee){
    hps2.splice(1,0,{judul: "Management Fee", nilai: commafy(dataKontrak.managementFeeHPS)});
  }
  var idxPPN = dataKontrak.cb_managementFee?2:1;  
  if(dataKontrak.isPPN){
    hps2.splice(idxPPN,0,{judul: "PPN 10%", nilai: commafy(dataKontrak.ppnHPS)});
  }

  if(dataKontrak.cb_managementFeePnw){
    pnw2.splice(1,0,{judul: "Management Fee", nilai: commafy(dataKontrak.managementFee)});
  }
  var idxPPNPnw = dataKontrak.cb_managementFeePnw?2:1;  
  if(dataKontrak.isPPN){
    pnw2.splice(idxPPNPnw,0,{judul: "PPN 10%", nilai: commafy(dataKontrak.ppn)});
  }
  

    //event.PreventDefault();
    loadFile(path, function(
      error,
      content
    ) {
      if (error) {
        throw error;
      }
      //var ImageModule = require("open-docxtemplater-image-module");
      var opts = {};
      opts.centered = true;
      opts.getImage = function (tagValue, tagName) {
        const base64Regex = /^data:image\/(png|jpg|svg|svg\+xml);base64,/;
        if (!base64Regex.test(tagValue)) {
          return false;
        }
        const stringBase64 = tagValue.replace(base64Regex, "");
        let binaryString;
        if (typeof window !== "undefined") {
          binaryString = window.atob(stringBase64);
        } else {
          binaryString = Buffer.from(stringBase64, "base64").toString(
            "binary"
          );
        }
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          const ascii = binaryString.charCodeAt(i);
          bytes[i] = ascii;
        }
        return bytes.buffer;
      };
      opts.getSize = function (img, tagValue, tagName) {
        var width = dataKontrak.HPSimgW;
        var height = dataKontrak.HPSimgH;
        const forceWidth = 620;
        const ratio = forceWidth / width;
        return [
          forceWidth,
          // calculate height taking into account aspect ratio
          Math.round(height * ratio),
        ];
      };
      

      var imageModule = new ImageModule(opts);

      const zip = new PizZip(content);
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
        nullGetter: nullGetter,
        //modules: [imageModule, fixDocPrCorruptionModule],
      }).compile();
      doc.setData(getDataSet(dataKontrak, hps2, pnw2));
      //console.log(hps2);
      try {
        // render the document (replace all occurences of {first_name} by John, {last_name} by Doe, ...)
        doc.render();
        //console.log(dataKontrak);
      } catch (error) {
        // The error thrown here contains additional information when logged with JSON.stringify (it contains a properties object containing all suberrors).
        function replaceErrors(key, value) {
          if (value instanceof Error) {
            return Object.getOwnPropertyNames(value).reduce(function(
              error,
              key
            ) {
              error[key] = value[key];
              return error;
            },
            {});
          }
          return value;
        }
        //console.log(JSON.stringify({ error: error }, replaceErrors));

        if (error.properties && error.properties.errors instanceof Array) {
          const errorMessages = error.properties.errors
            .map(function(error) {
              return error.properties.explanation;
            })
            .join('\n');
          //console.log('errorMessages', errorMessages);
          // errorMessages is a humanly readable message looking like this :
          // 'The tag beginning with "foobar" is unopened'
        }
        throw error;
      }
      const out = doc.getZip().generate({
        type: 'blob',
        mimeType:
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          //'application/pdf'
          //'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      }); //Output the document using Data-URI
      if(isPreview){
        
        //var newurl = window.URL.createObjectURL(out);
        //console.log("blob link: "+ newurl.substring(4,newurl.length+1));
        //console.log(doc.getZip);
        //var trim = newurl.substring(4,newurl.length+1);
        
        // setTimeout(()=>{
        //   document.getElementById("viewer").src = src;
        // },200)
        
        //document.getElementById("viewer").src = src;
        // return <DocViewer documents={{ uri: newurl }} />;
        var reader = new FileReader();
        const pvw = doc.getZip().generate({
          type: "arraybuffer",
          compression: "DEFLATE",
          //mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        })
        var blob = new Blob([pvw], {
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        });
        //saveAs(blob)
        try{
          reader.readAsDataURL(blob);
          reader.onloadend = function() {
            var base64data = reader.result;
            fetch(REACT_APP_URL_API+'/rest/uploadFileViewer.php', {
              method: 'POST',
              body: JSON.stringify({ base64: base64data, userid: dataKontrak.userid})
            }).then((response) => {
              //console.log(response)
              //var src = "https://view.officeapps.live.com/op/embed.aspx?src="+"https://sikarliaapi.000webhostapp.com/rest/asu.docx";//+"&embedded=true";
              //var src = "https://docs.google.com/viewerng/viewer?url="+"https://sikarliaapi.000webhostapp.com/rest/asu.docx"+"&embedded=true";
              var src = 'https://docs.google.com/viewer?url='+REACT_APP_URL_API+'/rest/previewDocx/'+dataKontrak.userid+'.docx&embedded=true';
              try{
                document.getElementById("viewer").src = src;

              }catch(e){
                
              }
              //return src;
            })
          };
        }
        catch(e){
          console.log(e);
        }
        return;
      }
      saveAs(out, dataKontrak.namaPekerjaan+'_output.docx');
    });
  };

function getDataSet(dataKontrak, hps2, pnw2=[]){
  if(dataKontrak.tipeKontrak == '200up' || dataKontrak.tipeKontrak == '100up'){
    return {
      namaPekerjaanCap: dataKontrak.namaPekerjaan.toUpperCase(),
      namaPekerjaan: dataKontrak.namaPekerjaan,
      suratPermintaanPPK: setTanggal(dataKontrak.suratPermintaanPPK),
      pengadaanBarJas: setTanggal(dataKontrak.pengadaanBarJas),
      HPS: setTanggal(dataKontrak.HPS),
      penawaranRKS: setTanggal(dataKontrak.penawaranRKS),
      pengajuanPenawaran: setTanggal(dataKontrak.pengajuanPenawaran),
      undanganEvaluasi: setTanggal(dataKontrak.undanganEvaluasi),
      evaluasi: setTanggal(dataKontrak.evaluasi),
      penetapanPenyedia: setTanggal(dataKontrak.penetapanPenyedia),
      suratKesanggupan: setTanggal(dataKontrak.suratKesanggupan),
      laporanPelaksanaan: setTanggal(dataKontrak.laporanPelaksanaan),
      suratPemesanan: setTanggal(dataKontrak.suratPemesanan),
      penandatangananKontrak: setTanggal(dataKontrak.penandatangananKontrak),
      pelaksanaanPekerjaan: dataKontrak.pelaksanaanPekerjaan,
      pelaksanaanPekerjaantblg: angkaTerbilang(dataKontrak.pelaksanaanPekerjaan),
      penyelesaianPekerjaan: setTanggal(dataKontrak.penyelesaianPekerjaan),
      pembayaran: setTanggal(dataKontrak.pembayaran),

      tglsuratPermintaanPPK: setTanggal(dataKontrak.suratPermintaanPPK,"tgl"),
      tglpengadaanBarJas: setTanggal(dataKontrak.pengadaanBarJas,"tgl"),
      tglHPS: setTanggal(dataKontrak.HPS,"tgl"),
      tglpenawaranRKS: setTanggal(dataKontrak.penawaranRKS,"tgl"),
      tglpengajuanPenawaran: setTanggal(dataKontrak.pengajuanPenawaran,"tgl"),
      tglundanganEvaluasi: setTanggal(dataKontrak.undanganEvaluasi,"tgl"),
      tglevaluasi: setTanggal(dataKontrak.evaluasi,"tgl"),
      tglpenetapanPenyedia: setTanggal(dataKontrak.penetapanPenyedia,"tgl"),
      tglSuratKesanggupan: setTanggal(dataKontrak.suratKesanggupan,"tgl"),
      tgllaporanPelaksanaan: setTanggal(dataKontrak.laporanPelaksanaan,"tgl"),
      tglsuratPemesanan: setTanggal(dataKontrak.suratPemesanan,"tgl"),
      tglpenandatangananKontrak: setTanggal(dataKontrak.penandatangananKontrak,"tgl"),
      tglpenyelesaianPekerjaan: setTanggal(dataKontrak.penyelesaianPekerjaan,"tgl"),
      tglpembayaran: setTanggal(dataKontrak.pembayaran,"tgl"),

      m1: getMonth(dataKontrak.suratPermintaanPPK),
      m2: getMonth(dataKontrak.pengadaanBarJas),
      m3: getMonth(dataKontrak.HPS),
      m4: getMonth(dataKontrak.penawaranRKS),
      m5: getMonth(dataKontrak.pengajuanPenawaran),
      m6: getMonth(dataKontrak.undanganEvaluasi),
      m7: getMonth(dataKontrak.evaluasi),
      m8: getMonth(dataKontrak.penetapanPenyedia),
      m9: getMonth(dataKontrak.suratKesanggupan),
      m10: getMonth(dataKontrak.laporanPelaksanaan),
      m11: getMonth(dataKontrak.suratPemesanan),
      m12: getMonth(dataKontrak.penandatangananKontrak),
      m14: getMonth(dataKontrak.penyelesaianPekerjaan),
      m15: getMonth(dataKontrak.pembayaran),

      namaPerusahaan: dataKontrak.namaPerusahaan,
      namaPerusahaanCap: dataKontrak.namaPerusahaan.toUpperCase(),
      alamatPerusahaan: dataKontrak.alamatPerusahaan,
      namaDirektur: dataKontrak.namaDirektur,
      npwpPerusahaan: dataKontrak.npwpPerusahaan,
      jabatan: dataKontrak.jabatan,

      namaGroupPokja: dataKontrak.namaGroupPokja,
      namaGroupPokja: dataKontrak.namaGroupPokja,
      pokja1: dataKontrak.pokja1,
      pokja2: dataKontrak.pokja2,
      pokja3: dataKontrak.pokja3,
      pokja4: dataKontrak.pokja4,
      pokja5: dataKontrak.pokja5,
      nipPokja1: dataKontrak.nipPokja1,

      hps: setTabelHPS(dataKontrak.TABEL),
      nego: setTabelNego(dataKontrak.TABELNego),
      hpsSUM: hps2,
      hrgtotal: commafy(dataKontrak.hrgtotal),
      hrgtotaltb: angkaTerbilang(dataKontrak.hrgtotal),
      pnw: setTabelHPS(dataKontrak.TABELPnw),
      pnwSUM: pnw2,
      hrgtotalPnw: commafy(dataKontrak.hrgtotalPNW),
      hrgtotalPnwtb: angkaTerbilang(dataKontrak.hrgtotalPNW),
      dayEvaluasi:setTanggal(dataKontrak.evaluasi, "day"),
      dateEvaluasi:setTanggal(dataKontrak.evaluasi, "dd"),
      monthEvaluasi:setTanggal(dataKontrak.evaluasi, "mm"),
      yearEvaluasi:setTanggal(dataKontrak.evaluasi, "yy"),

      daypenandatangananKontrak:setTanggal(dataKontrak.penandatangananKontrak, "day"),
      datepenandatangananKontrak:setTanggal(dataKontrak.penandatangananKontrak, "dd"),
      monthpenandatangananKontrak:setTanggal(dataKontrak.penandatangananKontrak, "mm"),
      yearpenandatangananKontrak:setTanggal(dataKontrak.penandatangananKontrak, "yy"),

      monthpdtKontrak: uppercaseFirstLetter(setTanggal(dataKontrak.penandatangananKontrak, "mm")),
      
      daypenyelesaianPekerjaan:setTanggal(dataKontrak.penyelesaianPekerjaan, "day"),
      datepenyelesaianPekerjaan:setTanggal(dataKontrak.penyelesaianPekerjaan, "dd"),
      monthpenyelesaianPekerjaan:setTanggal(dataKontrak.penyelesaianPekerjaan, "mm"),
      yearpenyelesaianPekerjaan:setTanggal(dataKontrak.penyelesaianPekerjaan, "yy"),

      daypembayaran:setTanggal(dataKontrak.pembayaran, "day"),
      datepembayaran:setTanggal(dataKontrak.pembayaran, "dd"),
      monthpembayaran:setTanggal(dataKontrak.pembayaran, "mm"),
      yearpembayaran:setTanggal(dataKontrak.pembayaran, "yy"),

      satPelaksanaanPkj:dataKontrak.satPlkPkj,
      jenisPengadaan:dataKontrak.jenisPengadaan,

      namaRek: dataKontrak.namaRek,
      noRek: dataKontrak.noRek,
      bankRek: dataKontrak.bankRek,

      year: getYear(dataKontrak.penandatangananKontrak),
      noPPBJ : "3 Tahun 2024 tanggal 2 Januari 2024",
      noDIPA : "SP DIPA-059.04-0/2024 Tanggal 24 November 2023",
      koordinator : dataKontrak.koordinator,
      nipkoordinator : dataKontrak.nipkoordinator,
      PPK : dataKontrak.PPK,
      nipPPK : dataKontrak.nipPPK,
      PPBJ : dataKontrak.PPBJ,
      nipPPBJ : dataKontrak.nipPPBJ,


      table: {
        "data": [
          [
            "Age",
            "44",
            "33",
            "42",
            "19"
          ],
          [
            "Address",
            "3374 Olen Thomas Drive Frisco Texas 75034",
            "352 Illinois Avenue Yamhill Oregon(OR) 97148",
            "1402 Pearcy Avenue Fort Wayne  Indiana(IN) 46804",
            "3088 Terry Lane Orlando Florida(FL) 32801"
          ],
          [
            "Contoh",
            "Ya","","",""
          ]
        ],
        "fixedColumns": [
          null,
          null,
          null,
          null,
          null
        ],
        "widths": [
          80,
          110,
          110,
          110,
          110
        ],
        "header": [
          "Table",
          "1",
          "2",
          "3",
          "4"
        ],
        "subheader": [
          "Name",
          "John",
          "Mary",
          "Larry",
          "Tom"
        ],
        "chunkSize": {
          "type": "dynamic",
          "size": {
            "min": 9000,
            "max": 9100
          }
        }
      }
    }
  }
  else{
    var dataSet = {
      namaPekerjaanCap: dataKontrak.namaPekerjaan.toUpperCase(),
      namaPekerjaan: dataKontrak.namaPekerjaan,
      suratPermintaanPPK: setTanggal(dataKontrak.suratPermintaanPPK),
      pengadaanBarJas: setTanggal(dataKontrak.pengadaanBarJas),
      HPS: setTanggal(dataKontrak.HPS),
      penawaranRKS: setTanggal(dataKontrak.penawaranRKS),
      pengajuanPenawaran: setTanggal(dataKontrak.pengajuanPenawaran),
      undanganEvaluasi: setTanggal(dataKontrak.undanganEvaluasi),
      evaluasi: setTanggal(dataKontrak.evaluasi),
      penetapanPenyedia: setTanggal(dataKontrak.penetapanPenyedia),
      laporanPelaksanaan: setTanggal(dataKontrak.laporanPelaksanaan),
      suratPemesanan: setTanggal(dataKontrak.suratPemesanan),
      penandatangananKontrak: setTanggal(dataKontrak.penandatangananKontrak),
      pelaksanaanPekerjaan: dataKontrak.pelaksanaanPekerjaan,
      pelaksanaanPekerjaantblg: angkaTerbilang(dataKontrak.pelaksanaanPekerjaan),
      penyelesaianPekerjaan: setTanggal(dataKontrak.penyelesaianPekerjaan),
      pembayaran: setTanggal(dataKontrak.pembayaran),

      tglsuratPermintaanPPK: setTanggal(dataKontrak.suratPermintaanPPK,"tgl"),
      tglpengadaanBarJas: setTanggal(dataKontrak.pengadaanBarJas,"tgl"),
      tglHPS: setTanggal(dataKontrak.HPS,"tgl"),
      tglpenawaranRKS: setTanggal(dataKontrak.penawaranRKS,"tgl"),
      tglpengajuanPenawaran: setTanggal(dataKontrak.pengajuanPenawaran,"tgl"),
      tglundanganEvaluasi: setTanggal(dataKontrak.undanganEvaluasi,"tgl"),
      tglevaluasi: setTanggal(dataKontrak.evaluasi,"tgl"),
      tglpenetapanPenyedia: setTanggal(dataKontrak.penetapanPenyedia,"tgl"),
      tgllaporanPelaksanaan: setTanggal(dataKontrak.laporanPelaksanaan,"tgl"),
      tglsuratPemesanan: setTanggal(dataKontrak.suratPemesanan,"tgl"),
      tglpenandatangananKontrak: setTanggal(dataKontrak.penandatangananKontrak,"tgl"),
      tglpenyelesaianPekerjaan: setTanggal(dataKontrak.penyelesaianPekerjaan,"tgl"),
      tglpembayaran: setTanggal(dataKontrak.pembayaran,"tgl"),

      m1: getMonth(dataKontrak.suratPermintaanPPK),
      m2: getMonth(dataKontrak.pengadaanBarJas),
      m3: getMonth(dataKontrak.HPS),
      m4: getMonth(dataKontrak.penawaranRKS),
      m5: getMonth(dataKontrak.pengajuanPenawaran),
      m6: getMonth(dataKontrak.undanganEvaluasi),
      m7: getMonth(dataKontrak.evaluasi),
      m8: getMonth(dataKontrak.penetapanPenyedia),
      m9: getMonth(dataKontrak.laporanPelaksanaan),
      m10: getMonth(dataKontrak.suratPemesanan),
      m11: getMonth(dataKontrak.penandatangananKontrak),
      m13: getMonth(dataKontrak.penyelesaianPekerjaan),
      m14: getMonth(dataKontrak.pembayaran),

      namaPerusahaan: dataKontrak.namaPerusahaan,
      namaPerusahaanCap: dataKontrak.namaPerusahaan.toUpperCase(),
      alamatPerusahaan: dataKontrak.alamatPerusahaan,
      namaDirektur: dataKontrak.namaDirektur,
      npwpPerusahaan: dataKontrak.npwpPerusahaan,
      jabatan: dataKontrak.jabatan,

      namaPerusahaanPembanding1: dataKontrak.namaPerusahaanPembanding1!=''?dataKontrak.namaPerusahaanPembanding1:'PT. XXXXXX (Perusahaan Pembanding 1)',
      alamatPerusahaanPembanding1: dataKontrak.alamatPerusahaanPembanding1!=''?dataKontrak.alamatPerusahaanPembanding1:'(Alamat Perusahaan Pembanding 1)',
      namaPerusahaanPembanding2: dataKontrak.namaPerusahaanPembanding2!=''?dataKontrak.namaPerusahaanPembanding2:'PT. YYYYY (Perusahaan Pembanding 2)',
      alamatPerusahaanPembanding2: dataKontrak.alamatPerusahaanPembanding2!=''?dataKontrak.alamatPerusahaanPembanding2:'(alamat perusahaan pembanding 2)',
      namaDirekturPembanding1: dataKontrak.namaDirekturPembanding1!=''?dataKontrak.namaDirekturPembanding1:'Nama Direktur',
      namaDirekturPembanding2: dataKontrak.namaDirekturPembanding2!=''?dataKontrak.namaDirekturPembanding2:'Nama Direktur',
      jabatanPmb1: dataKontrak.jabatanPmb1!=''?dataKontrak.jabatanPmb1:'Direktur Utama',
      jabatanPmb2: dataKontrak.jabatanPmb2!=''?dataKontrak.jabatanPmb2:'Direktur Utama',

      hrgtotal: commafy(dataKontrak.hrgtotal),
      hrgtotaltb: angkaTerbilang(dataKontrak.hrgtotal),
      hrgtotalPnw: commafy(dataKontrak.hrgtotalPNW),
      hrgtotalPnwtb: angkaTerbilang(dataKontrak.hrgtotalPNW),

      dayEvaluasi:setTanggal(dataKontrak.evaluasi, "day"),
      dateEvaluasi:setTanggal(dataKontrak.evaluasi, "dd"),
      monthEvaluasi:setTanggal(dataKontrak.evaluasi, "mm"),
      yearEvaluasi:setTanggal(dataKontrak.evaluasi, "yy"),

      daypenandatangananKontrak:setTanggal(dataKontrak.penandatangananKontrak, "day"),
      datepenandatangananKontrak:setTanggal(dataKontrak.penandatangananKontrak, "dd"),
      monthpenandatangananKontrak:setTanggal(dataKontrak.penandatangananKontrak, "mm"),
      yearpenandatangananKontrak:setTanggal(dataKontrak.penandatangananKontrak, "yy"),

      monthpdtKontrak: uppercaseFirstLetter(setTanggal(dataKontrak.penandatangananKontrak, "mm")),
      
      daypenyelesaianPekerjaan:setTanggal(dataKontrak.penyelesaianPekerjaan, "day"),
      datepenyelesaianPekerjaan:setTanggal(dataKontrak.penyelesaianPekerjaan, "dd"),
      monthpenyelesaianPekerjaan:setTanggal(dataKontrak.penyelesaianPekerjaan, "mm"),
      yearpenyelesaianPekerjaan:setTanggal(dataKontrak.penyelesaianPekerjaan, "yy"),

      daypembayaran:setTanggal(dataKontrak.pembayaran, "day"),
      datepembayaran:setTanggal(dataKontrak.pembayaran, "dd"),
      monthpembayaran:setTanggal(dataKontrak.pembayaran, "mm"),
      yearpembayaran:setTanggal(dataKontrak.pembayaran, "yy"),

      satPelaksanaanPkj:dataKontrak.satPlkPkj,

      namaRek: dataKontrak.namaRek,
      noRek: dataKontrak.noRek,
      bankRek: dataKontrak.bankRek,

      year: getYear(dataKontrak.penandatangananKontrak),
      noPPBJ : "3 Tahun 2024 tanggal 2 Januari 2024",
      noDIPA : "SP DIPA-059.04-0/2024 Tanggal 24 November 2023",
      koordinator : dataKontrak.koordinator,
      nipkoordinator : dataKontrak.nipkoordinator,
      PPK : dataKontrak.PPK,
      nipPPK : dataKontrak.nipPPK,
      PPBJ : dataKontrak.PPBJ,
      nipPPBJ : dataKontrak.nipPPBJ,

      table: {
        "data": [
          [
            "Age",
            "44",
            "33",
            "42",
            "19"
          ],
          [
            "Address",
            "3374 Olen Thomas Drive Frisco Texas 75034",
            "352 Illinois Avenue Yamhill Oregon(OR) 97148",
            "1402 Pearcy Avenue Fort Wayne  Indiana(IN) 46804",
            "3088 Terry Lane Orlando Florida(FL) 32801"
          ],
          [
            "Contoh",
            "Ya","","",""
          ]
        ],
        "fixedColumns": [
          null,
          null,
          null,
          null,
          null
        ],
        "widths": [
          80,
          110,
          110,
          110,
          110
        ],
        "header": [
          "Table",
          "1",
          "2",
          "3",
          "4"
        ],
        "subheader": [
          "Name",
          "John",
          "Mary",
          "Larry",
          "Tom"
        ],
        "chunkSize": {
          "type": "dynamic",
          "size": {
            "min": 9000,
            "max": 9100
          }
        }
      }
      //img:[],
      //imgHPS:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAIAAAACUFjqAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4QIJBywfp3IOswAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAAkUlEQVQY052PMQqDQBREZ1f/d1kUm3SxkeAF/FdIjpOcw2vpKcRWCwsRPMFPsaIQSIoMr5pXDGNUFd9j8TOn7kRW71fvO5HTq6qqtnWtzh20IqE3YXtL0zyKwAROQLQ5l/c9gHjfKK6wMZjADE6s49Dver4/smEAc2CuqgwAYI5jU9NcxhHEy60sni986H9+vwG1yDHfK1jitgAAAABJRU5ErkJggg==",
      //imgHPS:Base64String.decompress(dataKontrak.base64HPS),
    }


    var nmr, nmrSpc;
    if(dataKontrak.nmr == null || dataKontrak.nmr == '' || dataKontrak.nmr == undefined){
      nmr = "………";
      nmrSpc = "           ";
    }else{
      nmr = dataKontrak.nmr;
      nmrSpc = dataKontrak.nmr;
    }
      dataSet.nmr = nmr;
      dataSet.nmrSpc = nmrSpc;
    //if(dataKontrak.isHPSimg==true){
    //  dataSet.imgHPS = dataKontrak.base64HPS
    //}else if(dataKontrak.isHPSimg==false){
      dataSet.hdrHPS = [{no: "No", desc: "Description", qty:"Quantity", unitprice: "Unit Price", total: "Total"}];
      dataSet.hps = setTabelHPS(dataKontrak.TABEL);
      dataSet.hpsSUM = hps2;
      dataSet.pnw = setTabelHPS(dataKontrak.TABELPnw);
      dataSet.pnwSUM = pnw2;
      dataSet.nego = setTabelNego(dataKontrak.TABELNego);
    //}
    //console.log(dataSet);

      dataSet.jabatanKoor = dataKontrak.jabatanKoor;
      dataSet.jabatanPPK = dataKontrak.jabatanPPK;
    return dataSet;
  }
}

function nullGetter(part, scopeManager) {
  /*
      If the template is {#users}{name}{/} and a value is undefined on the
      name property:

      - part.value will be the string "name"
      - scopeManager.scopePath will be ["users"] (for nested loops, you would have multiple values in this array, for example one could have ["companies", "users"])
      - scopeManager.scopePathItem will be equal to the array [2] if
        this happens for the third user in the array.
      - part.module would be empty in this case, but it could be "loop",
        "rawxml", or or any other module name that you use.
  */

  if (!part.module) {
      // part.value contains the content of the tag, eg "name" in our example
      // By returning '{' and part.value and '}', it will actually do no replacement in reality. You could also return the empty string if you prefered.
      return '{' + part.value + '}';
      //return '';
  }
  if (part.module === "rawxml") {
      return "";
  }
  return "";
}

function setTanggal(dateInput,type=null){
  if(dateInput==null){
    return null;
  }
  var arrbulan =["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
  var arrhari = ["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"]
  var dateString = dateInput.split("-");
  var day = dateString[2];
  var month = dateString[1]-1;
  var year = dateString[0];
  var d = new Date(dateString[0],dateString[1]-1,dateString[2]);
  var hari = arrhari[d.getDay()];
  var output = [hari+",", day, arrbulan[month], year].join(" ");
  if(type=="tgl"){
    return [day, arrbulan[month], year].join(" ");
  }
  if(type=="day"){
    return hari.toUpperCase();
  }
  if(type=="dd"){
    return angkaTerbilang(day).toUpperCase();
  }
  if(type=="mm"){
    return arrbulan[month].toUpperCase();
  }
  if(type=="yy"){
    return angkaTerbilang(year).toUpperCase();
  }
  return output;
} 

function getMonth(dateInput){
  var dateString = dateInput.split("-");
  return dateString[1];
}
function getYear(dateInput){
  var dateString = dateInput.split("-");
  return dateString[0];
}
function setTabelHPS(dtTabel){
  var tblFIX = [];
  dtTabel.map((d,index)=>{
    var row = {
      no: index+1,
      descr: d.descr,
      qty: d.qty,
      freq: d.freq,
      unitprice: d.unitprice,
      total: d.total,
    }
    tblFIX.push(row);
  })

  return tblFIX;
}
function setTabelNego(dtTabel){
  var tblFIX = [];
  dtTabel.map((d,index)=>{
    var row = {
      no: index+1,
      uraianNego: d.uraian_nego,
      hasilNego: d.hasil_nego,
    }
    tblFIX.push(row);
  })

  return tblFIX;
}

function uppercaseFirstLetter(text){
  return text[0].toUpperCase() + text.slice(1).toLowerCase();
}