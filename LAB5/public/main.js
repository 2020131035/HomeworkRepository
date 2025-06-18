let movies = [];
let moviesOriginal = [];    //order by loaded priority -> radio check 풀렸을 때 이걸로 다시 렌더링
let filteredMovies = [];
let filteredMoviesOriginal=[];
let currentIndex=0;
const batchSize=4;  //한 번에 4개씩 불러오기
let filtered=false;
let currentChecked=null;

//다음 batch를 렌더링해주는 함수
function showMovies(movies){    
    const container = document.getElementById('movies');
    const subList = movies.slice(currentIndex, currentIndex+batchSize);

    subList.forEach(aMovie =>{
        const wrapper = document.createElement('div');  //이미지+설명+줄거리 wrapper
        const image = document.createElement('img');
        const info = document.createElement('div');
        const summary = document.createElement('div');
        summary.className="summary";
        summary.innerHTML="줄거리 : <br>"+aMovie.movie_overview;
        info.className ="movieInformation";
        //렌더링되는 영화정보 : 제목,개봉일,평점
        info.innerHTML = `
            <b>${aMovie.movie_title}<b><br>
            <img id="calendar" src="images/calendar.png" alt="Calendar"> ${aMovie.movie_release_date}<br>
            <img id="star" src="images/star.png" alt="Star"> ${aMovie.movie_rate}
        `;
    
        wrapper.className="singleMovieWrapper";
        //클릭하면 영화 설명 페이지로 넘어가도록 함
        wrapper.addEventListener('click', () => {
            window.location.href = `/movies/${aMovie.movie_id}`;
        });
        wrapper.style.cursor = "pointer"; // 마우스 올리면 포인터 표시
        image.src=aMovie.movie_image;
        image.alt=aMovie.movie_title;
        image.className="poster";
        wrapper.appendChild(image);
        wrapper.appendChild(info);
        wrapper.appendChild(summary);
        container.appendChild(wrapper);
    })
    currentIndex+=batchSize;
}

//페이지 로딩이 끝나면 실행되는 함수
window.addEventListener('DOMContentLoaded', ()=>{   
    //movies : index.js에서 가져온 글로벌 변수임 -> db 파일에서 불러온 것 -> fetch api를 사용하지 않음!
    movies = window.movies;
    moviesOriginal = [...window.movies];
    showMovies(movies);
    //키워드 검색 핸들러 구현
    //영화 제목이 키워드(하나의 단어)를 단어로서 포함하면 렌더링해줌
    document.getElementById('searchButton').addEventListener('click', function(event){
        const keyword=document.getElementById('searchingKeyword').value.toLowerCase();
        const container = document.getElementById('movies');
        container.innerHTML="";
        document.getElementById('movies').innerHTML="";
        currentIndex=0;
        if(keyword==""){
            filtered=false;
            currentIndex=0;
            showMovies(movies);
        }
        else{
            filtered=true;
            filteredMovies = movies.filter(aMovie=>aMovie.movie_title.toLowerCase().split(/\s+/).includes(keyword));
            filteredMoviesOriginal = movies.filter(aMovie=>aMovie.movie_title.toLowerCase().split(/\s+/).includes(keyword));
            showMovies(filteredMovies);
        }
        
    })

    //4가지 기준의 Sort 구현
    document.querySelectorAll('input[name="sort"]').forEach(radio=>{

        radio.addEventListener('click', ()=> {
            const checked = document.querySelector('input[name="sort"]:checked');
            const criterion = checked ? checked.value : null;
            let container = document.getElementById('movies');
            let sorted=[];
            let currentList = filtered ? filteredMovies : movies;
            container.innerHTML='';
            currentIndex=0;

            
            if(criterion=='descendingRate'){
                sorted=[...currentList].sort((Mov1, Mov2) => Mov2.movie_rate - Mov1.movie_rate);
            }
            else if(criterion=='ascendingRate'){
                sorted=[...currentList].sort((Mov1, Mov2) => Mov1.movie_rate - Mov2.movie_rate);
            }
            else if(criterion=='descendingRelease'){
                sorted=[...currentList].sort((Mov1, Mov2) => new Date(Mov2.movie_release_date) - new Date(Mov1.movie_release_date));
            }
            else if(criterion=='ascendingRelease'){
                sorted=[...currentList].sort((Mov1, Mov2) => new Date(Mov1.movie_release_date) - new Date(Mov2.movie_release_date));
            }
            //체크되어있지 않을 때, json파일에서 불러온 순서대로 다시 렌더링한다
            else if(criterion==null){
                if(filtered==false){
                    movies=moviesOriginal;
                    showMovies(movies);
                }
                else{
                    filteredMovies=filteredMoviesOriginal;
                    showMovies(filteredMovies);
                }
                
            }


            if(criterion!=null){
                showMovies(sorted);
                if(filtered==false){
                    movies=sorted;
                }
                else{
                    filteredMovies=sorted;
                }
            }
        })
        
    })
})

//Infinite Scroll 구현
window.addEventListener('scroll', () => {
    const scrolled=window.innerHeight+window.scrollY;
    const docHeight=document.body.offsetHeight;

    if(scrolled>=docHeight){
        if(filtered){
            showMovies(filteredMovies);
        }
        else{
            showMovies(movies);
        }
    }
})

function showDetail(){
    
}

//원래 radio는 헤제가 안 되는데 되게 구현
function toggleRadio(radio){
    if(currentChecked===radio){
        radio.checked=false;
        currentChecked=null;
    }
    else{
        currentChecked=radio;
    }

    if(currentChecked!=null){
        if(currentChecked.value=="descendingRate"){

        }
    }
}