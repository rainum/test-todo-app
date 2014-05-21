'use strict';

angular.module('Mashape-Todo').controller('TodoCtrl', function ($scope, $timeout, $routeParams, Restangular, ngProgressLite) {
  /**
   * Set http header with mobile phone from URL and
   * show preloader on rest requests
   */

  //$scope.editing = true;

  Restangular
      .setDefaultHeaders({ 'x-phone': $routeParams.phone })
      .addRequestInterceptor(function (elem) {
        ngProgressLite.start();

        return elem;
      })
      .addResponseInterceptor(function (data) {
        ngProgressLite.done();

        return data;
      });

  var todos = Restangular.all('todo');

  $scope.pageSize = 8; // items per page
  $scope.page = 1;
  $scope.editedTodo = null;
  $scope.query = '';

  /**
   * Watch search string change for updating todos list
   */

  $scope.$watch('query', function (newValue, oldValue) {
    if (newValue === oldValue) return; // Prevent non change trigger

    if ($scope.searchTimeout) $timeout.cancel($scope.searchTimeout);

    $scope.searchTimeout = $timeout($scope.updateList, 250);
  });

  /**
   * Fetch all todos with current page state
   * @param page - current page index
   * @param limit - items per page
   * @param q - search query
   */

  $scope.updateList = function () {
    $scope.todos = todos.getList({
      page: $scope.page,
      limit: $scope.pageSize,
      q: $scope.query
    }).$object;
  };

  $scope.updateList();

  /**
   * Add todo and keep proper page size
   * @param todo - new todo item
   */

  $scope.addTodo = function (todo) {
    if (!todo) return;

    todos.post(todo).then(function (todo) {
      $scope.newTodo = '';

      if ($scope.todos.length >= $scope.pageSize) {
        $scope.todos.shift()
      }

      $scope.todos.push(todo);
    });
  };

  /**
   * Edit todo item and save it or remove, if no title is specified
   * @param todo - item for editing
   */

  $scope.doneEditing = function (todo) {
    if (todo.markDeleted) return;

    $scope.editedTodo = null;

    if (!todo.title) {
      todo.markDeleted = true;
      $scope.destroyTodo(todo);
    } else {
      todo.save();
    }
  };

  $scope.editTodo = function (todo) {
    $scope.editedTodo = todo;
  };

  /**
   * Remove todo item and keep proper page size
   * @param todo - item for editing
   */

  $scope.destroyTodo = function (todo) {
    todo.remove().then(function () {
      $scope.todos.splice($scope.todos.indexOf(todo), 1);

      if (!$scope.todos.length) {
        $scope.updateList();
      }
    });
  };

  $scope.cancelEditing = function (todo) {
    if (todo.markDeleted) return;

    $scope.editedTodo = null;

    if (!todo.title) {
      todo.markDeleted = true;
      $scope.destroyTodo(todo);
    } else {
      todo.save();
    }
  };

  /**
   * Pagination
   * @param shift - page index shift, default is 1
   */

  $scope.changePage = function (shift) {
    $scope.page += shift;
    $scope.updateList();
  };
});