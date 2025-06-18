const fs = require('fs').promises;
var express = require("express");
const sqlite3 = require("sqlite3");
const sqlite = require("sqlite");
const app = express();


async function getDBConnection(){
    const db = await sqlite.open({
        filename:'product.db',
        driver:sqlite3.Database
    })
    return db;
}

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true })); 

//메인페이지 라우팅 : fetch API '안' 쓰고 db에서 직접 영화정보를 불러옴 -> window.movies 전역변수로 지정
//참고로, 메인페이지는 동적 페이지이므로 index.html을 사용하지 않고 여기서 html을 직접 return함
//또한, main.css는 login.html, signup.html, 메인페이지, 영화 설명 페이지(아래 html 코드)에 대한 CSS 파일임
//[메인페이지, 로그인 페이지, 회원가입 페이지, 영화설명 페이지] 모든 페이지에 대한 CSS가 입혀졌음 -> 영화 설명 페이지의 경우 아래 라우팅에서 main.css를 사용하는 html을 return하게 함
app.get('/', async (req, res) => {
    const db = await getDBConnection();
    const movies = await db.all('SELECT * FROM movies');
    const moviesJS = JSON.stringify(movies);
    console.log(moviesJS);
    const html=`
        <!DOCTYPE html>
        <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Movie Information Site</title>
                <link rel="stylesheet" href="main.css" type="text/css">
                <script>
                    window.movies = ${moviesJS};
                </script>
                <script src="/main.js"></script>
            </head>
            <body>
                <div>
                    <div class="headingWrapper">
                        <h1 class="animationHeading">인프밍 영화정보 사이트입니다.</h1>
                    </div>

                    <ul class="linkList">
                        <li><a href="/"><b>메인페이지</b></a></li>
                        <li><a href="login.html"><b>로그인</b></a></li>     <!--Main Page to Login Page-->
                        <li><a href="signup.html"><b>회원가입</b></a></li>  <!--Main Page to Signup Page-->
                    </ul>
                    <hr>
                    <br>

                    <div id= "search" class="searchByKeyword">
                        <input type="text" id="searchingKeyword" placeholder="키워드를 입력하세요">
                        <input type="submit" id="searchButton" value="검색하기">
                    </div>
                    <br>

                    <div id="contents">     
                        <div class="heading">
                            <h2>Movies</h2>
                        </div>
                        <div id="main">     
                            <div id="sortingCriterion">
                                <b>정렬기준</b><br><hr>
                                <label><input type="radio" name="sort" value="descendingRate" onclick="toggleRadio(this)">평점 내림차순</label><br><br>
                                <label><input type="radio" name="sort" value="ascendingRate" onclick="toggleRadio(this)">평점 오름차순</label><br><br>
                                <label><input type="radio" name="sort" value="descendingRelease" onclick="toggleRadio(this)">개봉 내림차순</label><br><br>
                                <label><input type="radio" name="sort" value="ascendingRelease" onclick="toggleRadio(this)">개봉 오름차순</label>
                            </div>
                    
                                
                            <div id="movies">   
                            </div>
                        </div>
                        
                    </div>
                </div>
                
            </body>
        </html>
    `;
    res.send(html);
})




//영화 후기 포스팅 라우팅
app.post('/comments', async (req, res) => {
    const { movie_id, text } = req.body;
    
    //일단 기존 커멘트 불러오고
    let comments = [];
    try {
        const data = await fs.readFile('comment.json', 'utf-8');
        if (data.trim()) {
        comments = JSON.parse(data);
        }
    } catch (err) {
        console.log('파일 없거나 파싱 실패, 새 배열로 시작:', err.message);
        comments = [];
    }

    //기존 커멘트에 새 댓글 추가하고
    comments.push({ movie_id: Number(movie_id), text });

    //업뎃된 후기목록 write한 후에 원래 영화페이지로 돌아감
    try {
        await fs.writeFile('comment.json', JSON.stringify(comments, null, 2), 'utf-8');
        res.redirect(`/movies/${movie_id}`);  // 저장 후 영화 설명 페이지로 이동함 -> 업데이트
    } catch (err) {
        console.error('댓글 저장에 실패함:', err.message);
        res.status(500).send('댓글 저장 중 서버 오류 발생');
    }
});



//영화 설명 페이지 라우팅
app.get('/movies/:movie_id', async (req,res)=>{
    const movieId = req.params.movie_id;
    const query = `SELECT * FROM movies WHERE movie_id=?`;
    let db = await getDBConnection();
    //영화정보 불러오기
    let movie=await db.get(query,[movieId]);
    console.log(movie);
    // 후기 읽기 (File I/O)
    const comments = await fs.readFile('comment.json', 'utf-8');
    const commentJSON = JSON.parse(comments);
    const movieComments = commentJSON.filter(c => c.movie_id == movieId);
    console.log(movieComments);
    const commentHTML = movieComments.map(c => `<p>${c.text}</p><hr style="border:0.5px solid #eee">`).join('');

    //main.css는 login.html, signup.html, index.html, 영화 설명 페이지(아래 html 코드)에 대한 CSS 파일임
    //모든 페이지에 대한 CSS가 입혀졌음
    res.send(`
        <!DOCTYPE html>
        <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Movie Information Site</title>
                <link rel="stylesheet" href="/main.css" type="text/css">
            </head>
            <body>
                <div>
                    <div class="headingWrapper">
                        <h1 class="animationHeading">인프밍 영화정보 사이트입니다.</h1>
                    </div>

                    <ul class="linkList">
                        <li><a href="/"><b>메인페이지</b></a></li>
                        <li><a href="/login.html"><b>로그인</b></a></li>     <!--Main Page to Login Page-->
                        <li><a href="/signup.html"><b>회원가입</b></a></li>  <!--Main Page to Signup Page-->
                    </ul>
                    <hr>
                    <br>

                    <div class="container">
                        <img class="poster" src="${movie.movie_image}" alt="${movie.movie_title} 포스터">

                        <div class="info">
                        <p><span class="label">🆔 영화 id:</span> ${movie.movie_id}</p>
                        <h3>🎬 영화 제목: ${movie.movie_title}</h2>
                        <p><span class="label">📅 개봉일:</span> ${movie.movie_release_date}</p>
                        <p><span class="label">⭐ 평점:</span> ${movie.movie_rate}</p>
                        <p><span class="label">📜 줄거리:</span><br>${movie.movie_overview}</p>
                        </div>
                    </div>

                    <hr>
                    <div class="reviewContainer">
                        <strong>💬 영화 후기</strong><br>
                        ${commentHTML}

                        <form method="POST" action="/comments">
                        <input type="hidden" name="movie_id" value="${movie.movie_id}">
                        <input type="text" name="text" placeholder="후기를 작성해보세요!" required>
                        <button type="submit">등록하기</button>
                        </form>
                    </div>
                </div>
            </body>
        </html>
    `);
})



app.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});