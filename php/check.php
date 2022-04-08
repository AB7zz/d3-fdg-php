<?php include '../db/db.php'; ?>
<?php
    $bid = $_POST['id'];
    $check = "SELECT COUNT(*) FROM pos WHERE id='$bid'";
    $runcheck = mysqli_query($con, $check);
    $total_rows = mysqli_fetch_array($runcheck)[0];
    if($total_rows == 0){
        echo $total_rows;
    }else{
        $xandy = "SELECT * FROM pos WHERE id = '$bid'";
        $runxandy = mysqli_query($con, $xandy);
        $fetch = mysqli_fetch_array($runxandy);
        $x = $fetch['x'];
        $y = $fetch['y'];
        $vx = $fetch['vx'];
        $vy = $fetch['vy'];
        echo $x . " " . $y . " " . $vx . " ". $vy;
    }
?>