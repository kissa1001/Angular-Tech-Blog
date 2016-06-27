var app = angular.module('techBlog', ['ngRoute','ngAnimate']);

app.config(function($routeProvider){
	$routeProvider
	.when('/', {
		templateUrl: '../templates/home.html',
		controller: 'HomeCtrl'
	})
	.when('/add', {
		templateUrl:'../templates/add-post.html',
		controller: 'addPostCtrl'
	})
	.when('/posts', {
		templateUrl:'../templates/posts.html',
		controller: 'PostsCtrl',
		resolve: {
			postPromise : function(postsService) {
				return postsService.getPosts();
			}
		}
	})
	.when('/posts/:id', {
		templateUrl : '../templates/post-details.html',
		controller : 'PostCtrl'
	})
	.when('/error', {
		template : '<p>Error Page Not Found</p>'
	});
})

app.service('postsService', ['$http', function($http){
	this.posts = [];
	var thisSer = this;

	this.getPosts = function(){
		return $http.get('/posts').success(function(data){
			angular.copy(data, thisSer.posts);
		});
	};

	this.createPost = function(post){
		return $http.post('/posts', post).success(function(data){
			thisSer.posts.push(data);
		});
	};

	this.get = function(id){
		return $http.get('/posts/' + id)
		.then(function(res){
			return res.data;
		});
	};

	this.delete = function(id){
		return $http.delete('/posts/' + id)
		.then(function(res){
			return res.data;
		});
	};

	this.upvote = function(post){
		return $http.put('/posts/' + post._id + '/upvote')
		.success(function(data){
			post.upvotes += 1;
		});
	};

	this.downvote = function(post){
		return $http.put('/posts/' + post._id + '/downvote')
		.success(function(data){
			post.upvotes -= 1;
		});
	};

	this.addComment = function(id, comment){
		return $http.post('/posts/' + id + '/comments', comment);
	};

}]);

app.controller('HomeCtrl', ['$scope',function($scope){
  //Nothing yet
}]);

app.controller('addPostCtrl', ['$scope','postsService',function($scope,postsService){
	$scope.addPost = function(){
		if(!$scope.title || $scope.title === '') { return; }
		postsService.createPost({
			title: $scope.title,
			tags: $scope.tags, 
			author: $scope.author,
			content: $scope.content,
		});
		$scope.title = '';
		$scope.tags = '';
		$scope.author = '';
		$scope.content= '';
	};
}]);

app.controller('PostsCtrl', ['$scope','postsService',function($scope,postsService){
	$scope.posts = postsService.posts;
	console.log($scope.posts);
	$scope.upvote = function(post) {
		postsService.upvote(post);
	};
	$scope.downvote = function(post) {
		postsService.downvote(post);
	};
}]);

app.controller('PostCtrl', ['$scope','postsService','$routeParams','$location', function($scope, postsService, $routeParams,$location){
	postsService.get($routeParams.id)
	.then(function(data){ 
		$scope.post = data;
	});
	$scope.upvote = function(post) {
		postsService.upvote(post);
	};
	$scope.downvote = function(post) {
		postsService.downvote(post);
	};
	$scope.addComment = function(){
		if($scope.body === '') { return; }
		postsService.addComment($routeParams.id, {
			body: $scope.body,
			author: $scope.author
		}).success(function(comment){
			$scope.post.comments.push(comment);
		});
		$scope.body = '';
		$scope.author = '';
	};
	$scope.deletePost = function(){
		postsService.delete($routeParams.id)
		.then(function(data){ 
			$location.path('/');
		});
	};
}]);
