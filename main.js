 var firebaseConfig = {
  apiKey: "AIzaSyD1hO8vMUKV_8gzTsgHz6hwmPGFYWxWtJ8",
  authDomain: "portfolio-favoritebook.firebaseapp.com",
  projectId: "portfolio-favoritebook",
  storageBucket: "portfolio-favoritebook.appspot.com",
  messagingSenderId: "1037889031239",
  appId: "1:1037889031239:web:e82761d0989623ff9a3562",
  measurementId: "G-Y9BDCHC1NC"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig); 
const db = firebase.firestore();
const collection = db.collection('favorite_book');

const getRequestURL = (searchText) => {
  const parameters = {
    applicationId: "1042532133891775191",
    formatVersion: 2,
    size: 9,
    title: encodeURI(searchText),
    booksGenreId: "001", // カテゴリ: 001は本
    hits: 30, // 最大取得件数: 1〜30
    page: 1, // 取得ページ: 1〜
    outOfStockFlag: 1, // 0: 品切れや販売終了も表示しない 1: 表示させる
    sort: encodeURI("-releaseDate"),
  };
  const url = `https://app.rakuten.co.jp/services/api/BooksBook/Search/20170404?applicationId=${parameters.applicationId}&formatVersion=${parameters.formatVersion}&size=${parameters.size}&title=${parameters.title}&booksGenreId=${parameters.booksGenreId}&hits=${parameters.hits}&page=${parameters.page}&outOfStockFlag=${parameters.outOfStockFlag}&sort=${parameters.sort}`;
  return url;
};

const rsGetRequestURL = () => {
    var parameters = {
      applicationId: "1042532133891775191",
      formatVersion: 2,
      size: 9,
      booksGenreId: "001", // カテゴリ: 001は本
      hits: 30, // 最大取得件数: 1〜30
      page: 1, // 取得ページ: 1〜
      outOfStockFlag: 1, // 0: 品切れや販売終了も表示しない 1: 表示させる
      sort: encodeURI("-releaseDate"),
    };
    var url = `https://app.rakuten.co.jp/services/api/BooksBook/Search/20170404?applicationId=${parameters.applicationId}&formatVersion=${parameters.formatVersion}&size=${parameters.size}&booksGenreId=${parameters.booksGenreId}&hits=${parameters.hits}&page=${parameters.page}&outOfStockFlag=${parameters.outOfStockFlag}&sort=${parameters.sort}`;
    return url;
};

const featuredGetRequestURL = () => {
const parameters = {
  applicationId: "1042532133891775191",
  formatVersion: 2,
  size: 9,
  booksGenreId: "001", // カテゴリ: 001は本
  hits: 30, // 最大取得件数: 1〜30
  page: 1, // 取得ページ: 1〜
  outOfStockFlag: 0, // 0: 品切れや販売終了も表示しない 1: 表示させる
  sort: encodeURI("sales"),
};
 const url = `https://app.rakuten.co.jp/services/api/BooksBook/Search/20170404?applicationId=${parameters.applicationId}&formatVersion=${parameters.formatVersion}&size=${parameters.size}&booksGenreId=${parameters.booksGenreId}&hits=${parameters.hits}&page=${parameters.page}&outOfStockFlag=${parameters.outOfStockFlag}&sort=${parameters.sort}`;
return url;
};


new Vue({
  el: "#app",
  data: {
    searchText: "",       //検索した文字
    search_books:[],      //検索した本
    rs_books: [],         //release_scheduled_books,近日発売予定の本
    featured_books: [],   //注目のアイテム
    selectIndex:null,
    selectFavorite:null,
    rsFlag:true,
    searchFlag:false,
    favorite_books:[],
    favorite_flag:false,
    favorite_listFlag:false,
  },
  created() {
    var rs_url = rsGetRequestURL();
    fetch(rs_url).then((response) => response.json()).then((data) => {
      this.rs_books = data.Items.map((items) => ({
        title: items.title,
        author: items.author,
        salesdate: items.salesDate,
        image: items.largeImageUrl,
        price: items.itemPrice,
        url: items.itemUrl,
        small_image:items.smallImageUrl,
        isbn:items.isbn,
      }));
    });
    var featured_url = featuredGetRequestURL();
    fetch(featured_url).then((response) => response.json()).then((data) => {
    this.featured_books = data.Items.map((items) => ({
      title: items.title,
      author: items.author,
      salesdate: items.salesDate,
      image: items.largeImageUrl,
      price: items.itemPrice,
      url: items.itemUrl,
    }));
  });
  collection.get().then((querySnapshot) => {
    //Firebaseに保存されている緯度経度を一個一個取り出してGooglemapにピンを打つ
    querySnapshot.forEach((doc) => {
      if(doc.exists){
        this.favorite_flag=true;
        this.favorite_books.push({
        title: doc.data().title,
        author: doc.data().author,
        salesdate: doc.data().salesdate,
        image: doc.data().image,
        price: doc.data().price,
        url: doc.data().url,
        small_image:doc.data().small_image,
        isbn:doc.data().isbn,
      });
      }
    });
  });
  },
  methods: {
    fetchSearchBooks() {
      const url = getRequestURL(this.searchText);
      fetch(url).then((response) => response.json()).then((data) => {
        this.search_books = data.Items.map((items) => ({
          title: items.title,
          author: items.author,
          salesdate: items.salesDate,
          image: items.largeImageUrl,
          price: items.itemPrice,
          url: items.itemUrl,
          small_image:items.smallImageUrl,
          isbn:items.isbn,
        }));
      }).then(()=>{
        this.rsFlag=false;
        this.searchFlag=true;
        this.favorite_listFlag=false;
      });
    },
    favoriteButtonShow(index){
      this.selectIndex=index;
    },
    favoriteButtonHidden(index){
       this.selectIndex=null;
    },
    favoriteButtonClick(index,book){
      this.selectFavorite=index;
      console.log(book);
      this.favorite_books.push({
        title: book.title,
        author: book.author,
        salesdate: book.salesdate,
        image: book.image,
        price: book.price,
        url: book.url,
        small_image:book.small_image,
        isbn:book.isbn,
      });
      
      //Firebaseにデータを保存
      this.favorite_flag=true;
      collection.add({
        title: book.title,
        author: book.author,
        salesdate: book.salesdate,
        image: book.image,
        price: book.price,
        url: book.url,
        small_image:book.small_image,
        isbn:book.isbn,
      }).then(doc=>{
        console.log("データの保存に成功しました。");
      });
    },
    favoriteButtonDelete(index,book){
    var book_id = book.isbn;
    this.favorite_books=this.favorite_books.filter((favorite_book)=>{
      return (favorite_book.isbn !== book_id);
    });
    console.log("削除実行");
    collection.get().then((querySnapshot)=>{
    querySnapshot.forEach((doc)=>{
      if(doc.data().isbn === book_id){
        collection.doc(doc.id).delete();
        console.log("削除しました");
      }
    });
    });
    },
    favoriteListShow(){
      this.rsFlag=false;
      this.searchFlag=false;
      this.favorite_listFlag=true;
    },
    homeWindowShow(){
      this.rsFlag=true;
      this.searchFlag=false;
      this.favorite_listFlag=false;
    },
  }
});
