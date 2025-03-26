export const setSession = (dataSession) => {

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
    getPenandatangan(yearNow, "Koordinator");
    getPenandatangan(yearNow, "PPK");
    getPenandatangan(yearNow, "PPBJ");
}

export const getPenandatangan = (yearInput, kategori) => {
    const REACT_APP_URL_API="https://www.sikarlia.com/api"
    const ro1 = {
        method: 'POST',
        //headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: kategori, year:yearInput })
      };
      fetch(REACT_APP_URL_API+'/rest/lookupPdt.php', ro1)
          .then(response => response.json())
          .then(respon => {
            var dataAPI = respon;
            
            if(dataAPI.response_code != 200){
              
            }else{
              localStorage.setItem("pdt"+kategori, JSON.stringify(dataAPI.data));
              console.log("pdtKoordinator");
              console.log(dataAPI.data);
  
              //this.setState({ pdtKoordinator : dataAPI});
            }
          });
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

