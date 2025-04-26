run:
	docker kill jupyter

	docker run \
		-d \
		--rm \
	    --name jupyter \
		-p 8888:8888 \
		-v $(shell PWD)/work:/home/jovyan/work \
		-v $(shell PWD)/config:/home/jovyan/.jupyter \
		-e NOTEBOOK_ARGS="--NotebookApp.token=''" \
		jupyter/tensorflow-notebook

open:
	open http://127.0.0.1:8888/lab

container:
	docker exec -it jupyter bash