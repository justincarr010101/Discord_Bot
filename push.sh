heroku container:push web -a weebwatcher 
heroku container:release web -a weebwatcher

heroku addons:attach my-originating-app::DATABASE -a weebwatcher