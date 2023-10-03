extends Area2D


var screen_size # Size of the game window.
var speed = 100

export(PackedScene) var soldier_scene

func _ready():
	screen_size = get_viewport_rect().size

# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta):
	var velocity = Vector2.ZERO # The player's movement vector.
	if Input.is_action_pressed("enemy_right"):
		velocity.x += 1
	if Input.is_action_pressed("enemy_left"):
		velocity.x -= 1
	if Input.is_action_pressed("enemy_down"):
		velocity.y += 1
	if Input.is_action_pressed("enemy_up"):
		velocity.y -= 1

	if velocity.length() > 0:
		velocity = velocity.normalized() * speed

	position += velocity * delta
	position.x = clamp(position.x, 0, screen_size.x)
	position.y = clamp(position.y, 0, screen_size.y)
	
	if Input.is_action_just_pressed("enemy_shoot"):
		create_soldier()

func create_soldier():
	var soldier = soldier_scene.instance()
	soldier.position = position

	get_parent().add_child(soldier)
