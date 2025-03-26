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
    console.log(years);
}