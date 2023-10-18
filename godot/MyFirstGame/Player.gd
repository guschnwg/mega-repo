extends KinematicBody2D

export var speed = 100
export var move_right = "move_right"
export var move_left = "move_left"
export var move_up = "move_up"
export var move_down = "move_down"
export var shoot = "player_shoot"
export var aim_right = "aim_right"
export var aim_left = "aim_left"
export var aim_up = "aim_up"
export var aim_down = "aim_down"

var bullet = preload("res://Bullet.tscn")

var screen_size # Size of the game window.
var shake = false
var can_fire = true
export var fire_rate = 0.5

func _ready():
	screen_size = get_viewport_rect().size

# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta):
	var velocity = Vector2.ZERO # The player's movement vector.
	if Input.is_action_pressed(move_right):
		velocity.x += 1
	if Input.is_action_pressed(move_left):
		velocity.x -= 1
	if Input.is_action_pressed(move_down):
		velocity.y += 1
	if Input.is_action_pressed(move_up):
		velocity.y -= 1

	if velocity.length() > 0:
		$Sprite.offset.y = 0

		velocity = velocity.normalized() * speed

		if velocity.x != 0:
			$Sprite.flip_h = velocity.x < 0

		var flip_multiplier = -1 if $Sprite.flip_h else 1
		if velocity.y < 0:
			$Sprite.rotation = (-0.2 if velocity.x == 0 else -0.1) * flip_multiplier
		elif velocity.y > 0:
			$Sprite.rotation = (0.2 if velocity.x == 0 else 0.1) * flip_multiplier
		else:
			$Sprite.rotation = 0.1 if velocity.x > 0 else -0.1
	else:
		$Sprite.rotation = 0
		if $Sprite.offset.y == 0:
			$Sprite.offset.y = 0.6

		if shake:
			shake = false
			$Sprite.rotation *= -1
			$Sprite.offset.y *= -1
			$ShakeTimer.start()

	# Collides, and don't get stuck on walls if we are sliding
	move_and_slide(velocity)

	# Just make sure to go back to the other side if we leave the screen
	position.x = fposmod(position.x, screen_size.x)
	position.y = fposmod(position.y, screen_size.y)

	var rect_position = Vector2.ZERO
	rect_position.x = Input.get_action_strength(aim_right) - Input.get_action_strength(aim_left)
	rect_position.y = Input.get_action_strength(aim_down) - Input.get_action_strength(aim_up)
	$Aim.rect_global_position = global_position + rect_position.normalized() * 25
	
#	if Input.is_action_just_pressed(shoot, true):
	if can_fire and rect_position != Vector2.ZERO:
		shoot(rect_position.angle())
		can_fire = false
		yield(get_tree().create_timer(fire_rate), "timeout")
		can_fire = true


func shoot(direction):
	var bullet_instance = bullet.instance()
	bullet_instance.global_position = $Aim.rect_global_position
	bullet_instance.apply_impulse(Vector2.ZERO, Vector2(1000, 0).rotated(direction))
	bullet_instance.add_collision_exception_with(self)
	get_tree().get_root().add_child(bullet_instance)


func _on_ShakeTimer_timeout():
	shake = true
