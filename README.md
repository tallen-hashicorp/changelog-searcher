# Shangelog Searcher
Search through hashicorp change logs for features

## Install
```bash
npm install
```

## To Run
```bash
node index.js --url https://raw.githubusercontent.com/hashicorp/vault/main/CHANGELOG.md
```

## For elastic search
```bash
node index.js --url https://raw.githubusercontent.com/hashicorp/vault/main/CHANGELOG.md -e http://127.0.0.1:9200 -q
```

### Run
```bash
docker run --name es01 -p 9200:9200 -p 9300:9300 --env "xpack.security.enabled=false" --env "discovery.type=single-node" docker.elastic.co/elasticsearch/elasticsearch:8.6.2
```

### Shutdown
```bash
docker rm -v es01
```

## TODO
* Make repo public
* Push data to elastic search
* Create a dashboard

