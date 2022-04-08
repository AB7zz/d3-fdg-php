<?php include '../db/db.php'; ?>
<?php
    $bid = $_POST['id'];
    $bx = $_POST['x'];
    $by = $_POST['y'];
    $bvx = $_POST['vx'];
    $bvy = $_POST['vy'];
    $check = "SELECT COUNT(*) FROM pos WHERE id='$bid'";
    $runcheck = mysqli_query($con, $check);
    $total_rows = mysqli_fetch_array($runcheck)[0];
    if($total_rows == 0){
        $insert = "INSERT INTO pos(id, x, y, vx, vy) VALUES('$bid', '$bx', '$by', '$bvx', '$bvy')";
	    $runinsert = mysqli_query($con, $insert);
    }else{
        $update = "UPDATE pos SET x = '$bx', y = '$by', vx = '$bvx', vy = '$bvy' WHERE id = '$bid'";
        $runupdate = mysqli_query($con, $update);
    }
?>