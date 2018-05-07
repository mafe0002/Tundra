let app = {
    url: "",
    baseUrl: "",
    profiles: [],
    favArray: [],
    init: function() {
       
       app.chooseGender();
        document.getElementById('favtab').addEventListener('click', app.showFav);
        document.getElementById('hometab').addEventListener('click', app.backHome);

    },
    getProfiles: function(url) {
        fetch(url)
            .then(function (response) {
                return response.json();
            }).then(function (data) {
                //saving data into global array.
                app.profiles = app.profiles.concat(data.profiles); 
            //you can also use app.profiles.push(...data.profiles);
            
                //decoding image url
                app.baseUrl = decodeURIComponent(data.imgBaseURL);
            
                //passing a shallow copy of data
                app.getCard(data.profiles.slice()); 

            }).catch(function (err) {
                console.error(err.message);
            });

    },
    checkProfile: function() {
        
        //check if app.profile.length < 3
        if (app.profiles.length < 3) {
            app.getProfiles(app.url);
        }

    },
    chooseGender: function() {
       
        //creating overlay
        let overlay = document.createElement('div');
        overlay.className = 'overlay';
        overlay.setAttribute("id", "Gender");
        overlay.style.display = "block";
        
        let section = document.createElement('section');
        section.className = 'message';
        
        let p1 = document.createElement('p'),
        p2 = document.createElement('p'),
        p3 = document.createElement('p');
        p1.textContent = "Hey!";
        p2.textContent = "Looking for a Soulmate?"
        p3.textContent = "What Gender interests you?";
        
        //creating form for overlay
        let label1 = document.createElement('label');
        label1.setAttribute('for', 'Male');
        label1.textContent = "Male";
        
        let label2 = document.createElement('label');
        label2.setAttribute('for', 'Female');
        label2.textContent = "Female";
        
        let input1 = document.createElement('input');
        input1.setAttribute('id', 'Male');
        input1.setAttribute('type', 'radio');
        input1.addEventListener('click', app.getUrl);
        
        let input2 = document.createElement('input');
        input2.setAttribute('id', 'Female');
        input2.setAttribute('type', 'radio');
        input2.addEventListener('click', app.getUrlf);
        
        let div1 = document.createElement('div');
        div1.setAttribute('id', 'm');
        div1.appendChild(label1);
        div1.appendChild(input1);
        
        let div2 = document.createElement('div');
        div2.setAttribute('id', 'f');
        div2.appendChild(label2);
        div2.appendChild(input2);
        
        let legend = document.createElement('legend');
        legend.textContent = "Select";
        let field = document.createElement('fieldset');
        field.appendChild(legend);
        field.appendChild(div1);
        field.appendChild(div2);
        
        let form = document.createElement('form');
        form.appendChild(field);
        section.appendChild(p1);
        section.appendChild(p2);
        section.appendChild(p3);
        section.appendChild(form);
        overlay.appendChild(section);
        
        let homePage = document.querySelector('#home');
        home.appendChild(overlay);
    },
    getUrl: function(){
        let removeOverlay = document.querySelector('#home #Gender');
        removeOverlay.style.display = 'none';
        
        //url for male
            app.url = "https://griffis.edumedia.ca/mad9022/tundra/get.profiles.php?gender=male";
            
            app.getProfiles(app.url);
    },
    getUrlf: function() {
        let removeOverlay = document.querySelector('#home .overlay');
        removeOverlay.style.display = 'none';
        
        //url for female
        app.url = "https://griffis.edumedia.ca/mad9022/tundra/get.profiles.php?gender=female";
        
        app.getProfiles(app.url);
    },
    getCard: function (newElements) {
        
        let section = document.querySelector('#home .content');

        //create cards
        newElements.forEach(profile => {

            let df = document.createDocumentFragment();
            let card = document.createElement('div');
            card.className = "card fixed top";
            card.setAttribute("id", profile.id);
            
            let img = document.createElement('img');
            img.setAttribute('src', "http://" + app.baseUrl + '/' + profile.avatar);
            df.appendChild(img);
            
            let header = document.createElement('header');
            let h3 = document.createElement('h3');
            h3.textContent = profile.first + " " + profile.last;
            h3.style.textAlign = 'center';
            header.appendChild(h3);
            df.appendChild(header);

            let p = document.createElement('p');
            p.textContent = profile.distance + " away from you.";
            p.style.textAlign = 'center';
            df.appendChild(p);
            
            card.appendChild(df);
            //to make sure new cards are being added behind old cards
            section.insertBefore(card, section.childNodes[0]);
            
            
            let tiny = new t$(card);
            tiny.addEventListener(t$.EventTypes.SWIPELEFT, app.deleteCard);
            tiny.addEventListener(t$.EventTypes.SWIPERIGHT, app.saveCard);
            
        });

        app.showCard();
    },
    showCard: function() {
        //displaying cards
        let cards = document.querySelectorAll('#home .card');
        cards.forEach(card => {
            setTimeout(()=> {card.classList.remove("top")}, 300);
        });
    },
    deleteProfile: function(id, className) {
        
        let Profiles = app.profiles;
        Profiles.forEach(Profile => {  
            
            if (Profile.id == id) {
                let index = Profiles.indexOf(Profile);
                Profiles.splice(index, 1);
                
                //delete card or div of deleted profile
                setTimeout(()=> { 
                   document.querySelector("." + className).remove();
                },500);
            }
      });
    },
    deleteCard: function(ev) {
        
        let card = ev.currentTarget;
        card.classList.add('goLeft');
        let id = card.id;
        
        //delete card and profile
        app.deleteProfile(id,'goLeft');
        
        //display confirmation message
        app.overlayInfo("deleted");
    
        app.checkProfile();
    },
    saveCard: function(ev) {
        
        let card = ev.currentTarget;
        card.classList.add('goRight');
        let id = card.id;
        let Profiles = app.profiles;
        
        //return an array of current profile that is swiped right
        let favorite = Profiles.filter(Profile => Profile.id == id);
        
        //delete card and profile
        app.deleteProfile(id,'goRight');
       
        /**********save in session storage************/
        app.favArray.push(favorite[0]);
        
        //set setSessionStorage
        sessionStorage.setItem('fav-profile', JSON.stringify(app.favArray));
        
        //display confirmation message
        app.overlayInfo("saved");
        
        app.checkProfile();
    },
    favCards: function() {
        
        let section = document.getElementById('favContent');
        
        //delete card after profile is deleted
        section.innerHTML = "";
        
        let profiles = [];
        profiles = JSON.parse(sessionStorage.getItem('fav-profile'));
        if(profiles.length == 0){
            
            
             let docf = document.createDocumentFragment();
                let card = document.createElement('div');
                card.className = "card";
                card.setAttribute('id', 'margin');
                
                let h3 = document.createElement('h3');
                h3.textContent = "List of Favorites is Empty.";
                h3.style.textAlign = 'center';
                docf.appendChild(h3);
                
                card.appendChild(docf);
                section.appendChild(card);
                console.log('working');

        } else if(!(profiles.length == 0)){
            
              //create cards for favorites
            
              profiles.forEach(profile => {
                let df = document.createDocumentFragment();
                let card = document.createElement('div');
                card.className = "card";
                card.classList.add('style');
                card.setAttribute("id", profile.id);

                let img = document.createElement('img');
                img.setAttribute('src', "http://" + app.baseUrl + profile.avatar);
                img.setAttribute('class', 'size');
                df.appendChild(img);

                let h4 = document.createElement('h4');
                h4.textContent = profile.first + " " + profile.last;
                h4.style.textAlign = 'center';
                df.appendChild(h4);
                    
                let p = document.createElement('p');
                p.textContent = "is " + profile.distance + " away.";
                p.style.textAlign = 'center';
                p.className = 't4-1';
                df.appendChild(p);

                let del = document.createElement('p');
                del.className = 'tab icon delete';
                del.setAttribute('id', 'padding');
                del.addEventListener('click', app.deleteFav);
                df.appendChild(del);

                card.appendChild(df);
                section.appendChild(card);
                    
                });
        }
        
        
        
    },
    showFav: function() {
        
        //show page for favorites
        document.querySelector('#home').classList.remove('active');
        document.querySelector('#fav').classList.add('active');
        document.getElementById('hometab').classList.remove('current');
        document.getElementById('favtab').classList.add('current');
       
        app.favCards();
        

    },
    overlayInfo: function(action){
       
        //create overlay that displays confirmation message
        let info = document.querySelector('#displayInfo');
        if(action == "deleted" ) {
                document.querySelector('#info').textContent = `Profile Deleted`;
        } else if(action == "saved"){
                document.querySelector('#info').textContent = `Profile saved`;
        }else if(action == "favoriteDeleted"){
                document.querySelector('#info').textContent = `Profile deleted from list of Favorites`; 
        }
        //display overlay
        info.style.display = "block";
        
        //hide overlay after 0.4s
        setTimeout(() => {info.style.display = "none"}, 400);
        
    },
    deleteFav: function(ev) {
        let favCard = ev.currentTarget.parentElement;
        let id = favCard.getAttribute("id");
        
        //get/fetch profiles from session storage
        let favprofiles = JSON.parse(sessionStorage.getItem('fav-profile'));
        
        //delete profile from Session storage
        favprofiles.forEach(favprofile => {
            if(favprofile.id == id){
                let index = favprofiles.indexOf(favprofile);
                favprofiles.splice(index, 1); 
                
                //set/save profiles to session storage
                sessionStorage.setItem('fav-profile', JSON.stringify(favprofiles));
            }
            
            //delete profile from app.favArrays
            let favArrays = app.favArray;
        favArrays.forEach((favArray) => {
            if(favArray.id == id){
                let index = favArrays.indexOf(favArray);
                favArrays.splice(index, 1);
            }
        });
    
            
    });
        
        //display confirmation message
        app.overlayInfo("favoriteDeleted");
        
        app.showFav();
    },
    backHome: function() {
        
        //show home page
        document.querySelector('#fav').classList.remove('active');
        document.querySelector('#home').classList.add('active');
        
        //show fovorites page
        document.getElementById('favtab').classList.remove('current');
        document.getElementById('hometab').classList.add('current');

    }
}

let deviceready = ('deviceready' in document) ? 'deviceready' : 'DOMContentLoaded';
document.addEventListener(deviceready, app.init);
