extends Area2D

var speed = 100

export(PackedScene) var soldier_scene
export var shoot = "enemy_shoot"
onready var player_one = get_node("/root/Main/Player1")
onready var player_two = get_node("/root/Main/Player2")

var count = 0

# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta):
	get_parent().offset += 250 * delta
	if Input.is_action_just_pressed(shoot):
		create_soldier(player_one if count % 2 == 0 else player_two)

func create_soldier(follow):
	var soldier = soldier_scene.instance()
	soldier.position = global_position
	soldier.player = follow

	get_tree().get_root().add_child(soldier)
	
	count += 1
