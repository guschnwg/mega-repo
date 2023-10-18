extends Area2D

var speed = 100

var soldier_scene = preload("res://EnemySoldier.tscn")
onready var player_one = get_node("/root/Main/Player1")
onready var player_two = get_node("/root/Main/Player2")

var count = 0

# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta):
	get_parent().offset += 250 * delta

	update()

func _ready():
	$Spawn.start()

func create_soldier():
	var follow = player_one if count % 2 == 0 else player_two

	var query = Physics2DShapeQueryParameters.new()
	query.set_shape($CollisionShape2D.get_shape())
	query.transform = global_transform
	if not get_world_2d().direct_space_state.intersect_shape(query, 1):
		var soldier = soldier_scene.instance()
		soldier.position = global_position
		soldier.player = follow

		get_tree().get_root().add_child(soldier)

	count += 1


func _on_Spawn_timeout():
	create_soldier()

	$Spawn.wait_time = randi() % 10
	$Spawn.start()

func _draw():
	var angle_to = range_lerp($Spawn.time_left, 0, $Spawn.wait_time, 0, 2 * PI)
	draw_arc(position, 20, 0, angle_to, 360, Color.white, 2, true)
